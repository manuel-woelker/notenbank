import { BaseEntity, CreateInput, Serialized } from './RepositoryTypes'
import { Repository, RepositorySchemas } from './Repository'
import { generateId } from '../generateId'

const DATABASE_METADATA_STORE = 'dbMetadata'
const DATABASE_CREATED_AT_KEY = 'createdAt'

/* 📖 # Why write a database creation timestamp during upgrades?
E2E tests create isolated temporary databases via query parameters. Recording
the creation time once, as ISO8601, makes those databases traceable without
coupling tests to application data stores.
*/

/**
 * Index configuration for IndexedDB object stores
 */
export interface IndexConfig {
  name: string
  keyPath: string | string[]
  options?: IDBIndexParameters
}

/**
 * Configuration for IndexedDBRepository
 *
 * @template T - The entity type
 * @template _TCreate - Unused type parameter for compatibility (prefixed with _ to indicate intentionally unused)
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
/**
 * Generic IndexedDB repository implementation
 *
 * Provides CRUD operations for entities stored in IndexedDB with automatic
 * serialization/deserialization of Date fields.
 *
 * @template T - The entity type (must extend BaseEntity)
 * @template TCreate - The creation input type (defaults to CreateInput<T>)
 */
export class IndexedDBRepository<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
> implements Repository<T, TCreate> {
  readonly schemas: RepositorySchemas<T, TCreate>
  private dbPromise: Promise<IDBDatabase>
  private config: RepositoryConfig<T, TCreate>

  constructor(config: RepositoryConfig<T, TCreate>) {
    this.config = config
    this.schemas = config.schemas
    this.dbPromise = this.initDB()
  }

  /**
   * Initialize IndexedDB database and object store
   */
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = (event.target as IDBOpenDBRequest).transaction

        if (!db.objectStoreNames.contains(DATABASE_METADATA_STORE)) {
          db.createObjectStore(DATABASE_METADATA_STORE, { keyPath: 'key' })
        }

        if (event.oldVersion === 0 && transaction) {
          const metadataStore = transaction.objectStore(DATABASE_METADATA_STORE)
          metadataStore.add({
            key: DATABASE_CREATED_AT_KEY,
            value: new Date().toISOString(),
          })
        }

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, {
            keyPath: 'id',
          })

          // Create indexes if specified
          this.config.indexes?.forEach((indexConfig) => {
            store.createIndex(
              indexConfig.name,
              indexConfig.keyPath,
              indexConfig.options
            )
          })
        }

        this.config.onUpgrade?.(db)
      }
    })
  }

  /**
   * Get object store for transactions
   */
  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise
    const transaction = db.transaction(this.config.storeName, mode)
    return transaction.objectStore(this.config.storeName)
  }

  /**
   * Retrieve all entities
   */
  async findAll(): Promise<T[]> {
    const store = await this.getStore('readonly')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const entities = request.result.map((data) =>
          this.validateEntity(this.deserialize(data))
        )
        resolve(entities)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Find an entity by ID
   */
  async findById(id: string): Promise<T | null> {
    const store = await this.getStore('readonly')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? this.validateEntity(this.deserialize(result)) : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Create a new entity
   */
  async create(data: TCreate): Promise<T> {
    const validatedInput = this.validateCreateInput(data)
    const now = new Date()
    // Type assertion is safe here because we're adding the required BaseEntity fields
    // (id, createdAt, updatedAt) to TCreate to construct T
    const newEntity = this.validateEntity({
      ...validatedInput,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T)

    const store = await this.getStore('readwrite')
    return new Promise((resolve, reject) => {
      const request = store.add(this.serialize(newEntity))
      request.onsuccess = () => resolve(newEntity)
      request.onerror = () => reject(request.error)
    })
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
      id: existing.id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    })

    const store = await this.getStore('readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(this.serialize(updated))
      request.onsuccess = () => resolve(updated)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<void> {
    const store = await this.getStore('readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /* 📖 # Why default serialization for createdAt and updatedAt?
   *
   * All entities extending BaseEntity have createdAt and updatedAt Date fields.
   * IndexedDB cannot store Date objects directly - they must be converted to strings.
   *
   * The default serializer handles these standard fields automatically, so entity-specific
   * repositories don't need to provide serialization logic unless they have additional
   * Date fields (e.g., Student.birthDate).
   */
  /**
   * Serialize entity for storage (convert Date to ISO string)
   */
  private serialize(entity: T): Serialized<T> {
    if (this.config.serialize) {
      return this.config.serialize(entity)
    }

    // Default serialization for createdAt and updatedAt
    return {
      ...entity,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    } as Serialized<T>
  }

  /**
   * Deserialize entity from storage (convert ISO string to Date)
   */
  private deserialize(data: Serialized<T>): T {
    if (this.config.deserialize) {
      return this.config.deserialize(data)
    }

    // Default deserialization for createdAt and updatedAt
    return {
      ...data,
      createdAt: new Date((data as { createdAt: string }).createdAt),
      updatedAt: new Date((data as { updatedAt: string }).updatedAt),
    } as T
  }

  /* 📖 # Why validate data using optional schemas?
   *
   * Repository consumers may supply runtime schemas (via zod) to guard against
   * corrupted storage data and malformed inputs.
   *
   * Validation is optional to keep low-friction usage for cases where runtime
   * checking is unnecessary or already handled elsewhere.
   */
  private validateEntity(entity: T): T {
    return this.config.schemas.entity.parse(entity)
  }

  private validateCreateInput(data: TCreate): TCreate {
    return this.config.schemas.create.parse(data)
  }

  private validateUpdateInput(data: Partial<T>): Partial<T> {
    const updateSchema = this.config.schemas?.update
    if (!updateSchema) {
      return data
    }

    return updateSchema.parse(data)
  }
}
