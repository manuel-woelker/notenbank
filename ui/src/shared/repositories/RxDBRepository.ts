/* 📖 # Why replace IndexedDBRepository with RxDB?
 *
 * The hand-rolled IndexedDBRepository (~470 lines) directly manages IndexedDB
 * connections, transactions, serialization, and schema upgrades. RxDB provides
 * a higher-level API over IndexedDB (via Dexie) that eliminates this complexity
 * while keeping the same Repository<T, TCreate> interface.
 */
import {
  createRxDatabase,
  removeRxDatabase,
  type RxDatabase,
  type RxCollection,
  type RxJsonSchema,
} from 'rxdb/plugins/core'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import type { BaseEntity, CreateInput, Serialized } from './RepositoryTypes'
import type { Repository, RepositorySchemas } from './Repository'
import { generateId } from '../generateId'
import type { IndexConfig, RepositoryConfig } from './IndexedDBRepository'

/* 📖 # Why cache databases at module level?
 *
 * Multiple repositories share the same database (e.g., all "notenbank" stores).
 * Caching the database promise prevents duplicate database creation and ensures
 * all collections for a given database are added to the same instance.
 */
const databaseCache = new Map<string, Promise<RxDatabase>>()

function getOrCreateDatabase(dbName: string): Promise<RxDatabase> {
  const existing = databaseCache.get(dbName)
  if (existing) return existing

  const promise = createRxDatabase({
    name: dbName,
    storage: getRxStorageDexie(),
    multiInstance: false,
    closeDuplicates: true,
  })
  databaseCache.set(dbName, promise)
  return promise
}

/* 📖 # Why use a permissive RxDB JSON Schema?
 *
 * We rely on Zod for data validation, not RxDB's JSON Schema. The RxDB schema
 * only needs to define the primary key and indexed fields with their required
 * constraints (maxLength for strings). Using additionalProperties: true lets
 * any extra fields pass through without maintaining two parallel schemas.
 */
function buildRxJsonSchema(
  indexes?: IndexConfig[]
): RxJsonSchema<Record<string, unknown>> {
  const properties: Record<string, { type: string; maxLength?: number }> = {
    id: { type: 'string', maxLength: 100 },
  }

  const rxIndexes: (string | string[])[] = []

  for (const idx of indexes ?? []) {
    if (Array.isArray(idx.keyPath)) {
      for (const field of idx.keyPath) {
        if (!properties[field]) {
          properties[field] = { type: 'string', maxLength: 500 }
        }
      }
      rxIndexes.push([...idx.keyPath])
    } else {
      if (!properties[idx.keyPath]) {
        properties[idx.keyPath] = { type: 'string', maxLength: 500 }
      }
      rxIndexes.push(idx.keyPath)
    }
  }

  const required = ['id', ...Object.keys(properties).filter((k) => k !== 'id')]

  /* 📖 # Why cast additionalProperties to bypass RxDB's type restriction?
   *
   * RxDB's TypeScript types only allow `additionalProperties: false`, but
   * we need `true` because our entities have fields not declared in the
   * RxDB schema (we rely on Zod for validation, not RxDB's JSON Schema).
   * At runtime RxDB accepts `true` without issues.
   */
  return {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties,
    required,
    indexes: rxIndexes,
    additionalProperties: true as unknown as false,
  } as RxJsonSchema<Record<string, unknown>>
}

/* 📖 # Why remove (not just close) all databases?
 *
 * Closing a database preserves its data in IndexedDB, but if a collection
 * is re-created with a different schema (e.g., different indexes between
 * tests), RxDB throws a schema mismatch error (DB6). Using remove()
 * deletes all data so databases can be cleanly re-created.
 *
 * In production this is safe because clearAllRepositoryCaches is only
 * called from resetExampleDatabase, where the target database has
 * already been removed by removeRxDatabaseByName.
 */
export async function destroyAllRxDatabases(): Promise<void> {
  const promises = [...databaseCache.values()]
  databaseCache.clear()
  for (const dbPromise of promises) {
    try {
      const db = await dbPromise
      await db.remove()
    } catch {
      // ignore cleanup errors
    }
  }
}

/**
 * Remove a specific RxDB database by name (deletes all data permanently).
 * Used for Tabula Rasa reset of the example database.
 */
export async function removeRxDatabaseByName(dbName: string): Promise<void> {
  const cached = databaseCache.get(dbName)
  if (cached) {
    databaseCache.delete(dbName)
    try {
      const db = await cached
      await db.remove()
      return
    } catch {
      // fall through to removeRxDatabase
    }
  }
  await removeRxDatabase(dbName, getRxStorageDexie())
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

export class RxDBRepository<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
> implements Repository<T, TCreate> {
  readonly schemas: RepositorySchemas<T, TCreate>
  private config: RepositoryConfig<T, TCreate>

  constructor(config: RepositoryConfig<T, TCreate>) {
    this.config = config
    this.schemas = config.schemas
  }

  private async getCollection(): Promise<RxCollection> {
    const db = await getOrCreateDatabase(this.config.dbName)
    const name = this.config.storeName

    if (db[name]) {
      return db[name] as RxCollection
    }

    const schema = buildRxJsonSchema(this.config.indexes)
    const collections = await db.addCollections({
      [name]: { schema },
    })
    return collections[name]
  }

  private extractData(doc: {
    toJSON(): Record<string, unknown>
  }): Serialized<T> {
    const json = doc.toJSON()
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(json)) {
      if (!key.startsWith('_')) {
        result[key] = value
      }
    }
    return result as Serialized<T>
  }

  async findAll(): Promise<T[]> {
    const collection = await this.getCollection()
    const docs = await collection.find().exec()
    return docs.map((doc) =>
      this.validateEntity(this.deserialize(this.extractData(doc)))
    )
  }

  async findById(id: string): Promise<T | null> {
    const collection = await this.getCollection()
    const doc = await collection.findOne(id).exec()
    if (!doc) return null
    return this.validateEntity(this.deserialize(this.extractData(doc)))
  }

  async create(data: TCreate): Promise<T> {
    const validatedInput = this.validateCreateInput(data)
    const now = new Date()
    const newEntity = this.validateEntity({
      ...validatedInput,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T)

    const collection = await this.getCollection()
    await collection.insert(this.serialize(newEntity))
    return newEntity
  }

  async createMultiple(dataArray: TCreate[]): Promise<T[]> {
    if (dataArray.length === 0) return []

    const timerLabel = `createMultiple(${this.config.storeName}, ${dataArray.length} entities)`
    console.time(timerLabel)

    const now = new Date()
    const newEntities = dataArray.map((data) => {
      const validatedInput = this.validateCreateInput(data)
      return this.validateEntity({
        ...validatedInput,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      } as unknown as T)
    })

    const collection = await this.getCollection()
    const result = await collection.bulkInsert(
      newEntities.map((entity) => this.serialize(entity))
    )

    if (result.error.length > 0) {
      console.timeEnd(timerLabel)
      throw result.error[0]
    }

    console.timeEnd(timerLabel)
    return newEntities
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error(`Entity with id ${id} not found`)
    }

    const updated: T = this.validateEntity({
      ...existing,
      ...this.validateUpdateInput(data),
      id: existing.id,
      updatedAt: new Date(),
    })

    const collection = await this.getCollection()
    const doc = await collection.findOne(id).exec()
    if (!doc) throw new Error(`Entity with id ${id} not found`)

    const serialized = {
      ...(this.serialize(updated) as Record<string, unknown>),
    }
    delete serialized.id
    await doc.patch(serialized)
    return updated
  }

  async delete(id: string): Promise<void> {
    const collection = await this.getCollection()
    const doc = await collection.findOne(id).exec()
    if (doc) {
      await doc.remove()
    }
  }

  /* 📖 # Why generic Date serialization instead of only createdAt/updatedAt?
   *
   * RxDB stores data as JSON internally, so Date objects are not preserved
   * (unlike raw IndexedDB which uses structured cloning). The generic approach
   * converts ALL Date fields to ISO strings on write and back to Date on read,
   * handling entities like Assessment (with a `date` field) automatically.
   */
  private serialize(entity: T): Serialized<T> {
    if (this.config.serialize) {
      return this.config.serialize(entity)
    }

    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(
      entity as Record<string, unknown>
    )) {
      result[key] = value instanceof Date ? value.toISOString() : value
    }
    return result as Serialized<T>
  }

  private deserialize(data: Serialized<T>): T {
    if (this.config.deserialize) {
      return this.config.deserialize(data)
    }

    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>
    )) {
      result[key] =
        typeof value === 'string' && ISO_DATE_REGEX.test(value)
          ? new Date(value)
          : value
    }
    return result as T
  }

  private validateEntity(entity: T): T {
    return this.config.schemas.entity.parse(entity)
  }

  private validateCreateInput(data: TCreate): TCreate {
    return this.config.schemas.create.parse(data)
  }

  private validateUpdateInput(data: Partial<T>): Partial<T> {
    const updateSchema = this.config.schemas?.update
    if (!updateSchema) return data
    return updateSchema.parse(data)
  }
}
