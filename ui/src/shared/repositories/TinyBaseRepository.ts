import { createStore, type Store } from 'tinybase'
import {
  createIndexedDbPersister,
  type IndexedDbPersister,
} from 'tinybase/persisters/persister-indexed-db'
import type { BaseEntity, CreateInput, Serialized } from './RepositoryTypes'
import type { Repository, RepositorySchemas } from './Repository'
import { generateId } from '../generateId'

/**
 * Index configuration for repository tables
 */
export interface IndexConfig {
  name: string
  keyPath: string | string[]
  options?: IDBIndexParameters
}

/**
 * Configuration for TinyBaseRepository
 *
 * @template T - The entity type
 * @template TCreate - The creation input type
 */
export interface RepositoryConfig<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
> {
  dbName: string
  dbVersion: number
  storeName: string
  indexes?: IndexConfig[]
  schemas: RepositorySchemas<T, TCreate>
  onUpgrade?: (db: IDBDatabase) => void
  /**
   * Custom serializer for entities with additional Date fields beyond createdAt/updatedAt
   */
  serialize?: (entity: T) => Serialized<T>
  /**
   * Custom deserializer for entities with additional Date fields beyond createdAt/updatedAt
   */
  deserialize?: (data: Serialized<T>) => T
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

/* 📖 # Why cache stores at module level?
 *
 * Multiple repositories share the same database (e.g., all "notenbank" tables).
 * Caching the store and persister prevents duplicate database creation and ensures
 * all tables for a given database use the same TinyBase instance with auto-save.
 */
const storeCache = new Map<string, Store>()
const persisterCache = new Map<string, IndexedDbPersister>()

function getOrCreateStore(dbName: string): Store {
  const existing = storeCache.get(dbName)
  if (existing) return existing

  const store = createStore()
  storeCache.set(dbName, store)
  return store
}

async function getOrCreatePersister(
  dbName: string
): Promise<IndexedDbPersister> {
  const existing = persisterCache.get(dbName)
  if (existing) return existing

  const store = getOrCreateStore(dbName)
  const persister = createIndexedDbPersister(store, dbName)

  // Load existing data and start auto-save
  await persister.load()
  await persister.startAutoSave()

  persisterCache.set(dbName, persister)
  return persister
}

/* 📖 # Why destroy all stores instead of just closing?
 *
 * For test isolation, we need to completely clear all cached stores and persisters.
 * This ensures that subsequent tests start with a clean slate without any
 * leftover data or auto-save subscriptions.
 */
export async function destroyAllTinyBaseStores(): Promise<void> {
  const promises = [...persisterCache.values()].map(async (persister) => {
    try {
      await persister.stopAutoSave()
      await persister.destroy()
    } catch {
      // Ignore cleanup errors
    }
  })

  await Promise.all(promises)
  persisterCache.clear()
  storeCache.clear()
}

/**
 * Remove a specific TinyBase database by name (deletes all data permanently).
 * Used for Tabula Rasa reset of the example database.
 */
export async function removeTinyBaseDatabaseByName(
  dbName: string
): Promise<void> {
  // Stop and destroy the persister if cached
  const persister = persisterCache.get(dbName)
  if (persister) {
    persisterCache.delete(dbName)
    storeCache.delete(dbName)
    try {
      await persister.stopAutoSave()
      await persister.destroy()
    } catch {
      // Ignore cleanup errors
    }
  }

  // Delete the IndexedDB database
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => {
      // Database is blocked by another connection, but will be deleted
      // when those connections close
      resolve()
    }
  })
}

/**
 * TinyBase-based repository implementation
 *
 * Provides CRUD operations for entities stored in IndexedDB via TinyBase
 * with automatic persistence and reactive updates.
 *
 * @template T - The entity type (must extend BaseEntity)
 * @template TCreate - The creation input type (defaults to CreateInput<T>)
 */
export class TinyBaseRepository<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
> implements Repository<T, TCreate> {
  readonly schemas: RepositorySchemas<T, TCreate>
  private config: RepositoryConfig<T, TCreate>
  private storePromise: Promise<Store>

  constructor(config: RepositoryConfig<T, TCreate>) {
    this.config = config
    this.schemas = config.schemas
    this.storePromise = this.initStore()
  }

  /**
   * Initialize TinyBase store and persister
   */
  private async initStore(): Promise<Store> {
    // Initialize the persister (this also loads existing data and starts auto-save)
    await getOrCreatePersister(this.config.dbName)
    return getOrCreateStore(this.config.dbName)
  }

  /**
   * Get the TinyBase store instance
   */
  private async getStore(): Promise<Store> {
    return this.storePromise
  }

  /**
   * Retrieve all entities
   */
  async findAll(): Promise<T[]> {
    const store = await this.getStore()
    const table = store.getTable(this.config.storeName)
    const entities: T[] = []

    for (const [id, row] of Object.entries(table)) {
      const data = { ...row, id } as unknown as Serialized<T>
      entities.push(this.validateEntity(this.deserialize(data)))
    }

    return entities
  }

  /**
   * Find an entity by ID
   */
  async findById(id: string): Promise<T | null> {
    const store = await this.getStore()
    const row = store.getRow(this.config.storeName, id)

    // TinyBase returns empty object {} for non-existent rows
    if (!row || Object.keys(row).length === 0) return null

    const data = { ...row, id } as unknown as Serialized<T>
    return this.validateEntity(this.deserialize(data))
  }

  /**
   * Create a new entity
   */
  async create(data: TCreate): Promise<T> {
    const validatedInput = this.validateCreateInput(data)
    const now = new Date()
    const newEntity = this.validateEntity({
      ...validatedInput,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T)

    const store = await this.getStore()
    const serialized = this.serialize(newEntity)
    const { id, ...rowData } = serialized as Record<string, unknown>

    store.setRow(
      this.config.storeName,
      id as string,
      rowData as Record<string, string | number | boolean>
    )

    return newEntity
  }

  /**
   * Create multiple entities in a single transaction
   */
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

    const store = await this.getStore()

    // Use TinyBase transaction for atomic batch operation
    store.transaction(() => {
      for (const entity of newEntities) {
        const serialized = this.serialize(entity)
        const { id, ...rowData } = serialized as Record<string, unknown>
        store.setRow(
          this.config.storeName,
          id as string,
          rowData as Record<string, string | number | boolean>
        )
      }
    })

    console.timeEnd(timerLabel)
    return newEntities
  }

  /**
   * Update an existing entity
   */
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

    const store = await this.getStore()
    const serialized = this.serialize(updated)
    const { id: _id, ...rowData } = serialized as Record<string, unknown>
    void _id // id is already used as the row key

    store.setRow(
      this.config.storeName,
      id,
      rowData as Record<string, string | number | boolean>
    )

    return updated
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<void> {
    const store = await this.getStore()
    store.delRow(this.config.storeName, id)
  }

  /* 📖 # Why generic Date serialization instead of only createdAt/updatedAt?
   *
   * TinyBase stores data as JSON internally, so Date objects are not preserved.
   * The generic approach converts ALL Date fields to ISO strings on write
   * and back to Date on read, handling entities like Assessment (with a `date` field) automatically.
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
