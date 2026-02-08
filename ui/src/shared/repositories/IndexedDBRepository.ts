import { BaseEntity, CreateInput, Serialized } from './types'
import { Repository, RepositorySchemas } from './Repository'

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
      id: crypto.randomUUID(),
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

// Tests
if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { IDBFactory } = await import('fake-indexeddb')
  const { z } = await import('zod')

  interface TestEntity extends BaseEntity {
    name: string
  }

  type CreateTestEntity = CreateInput<TestEntity>

  describe('IndexedDBRepository', () => {
    let repository: IndexedDBRepository<TestEntity, CreateTestEntity>

    const schemas = {
      entity: z.object({
        id: z.string(),
        name: z.string().min(1),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
      create: z.object({
        name: z.string().min(1),
      }),
      update: z.object({
        name: z.string().min(1).optional(),
      }),
    }

    beforeEach(() => {
      // Reset IndexedDB for each test
      globalThis.indexedDB = new IDBFactory()
      repository = new IndexedDBRepository<TestEntity, CreateTestEntity>({
        dbName: 'test-db',
        dbVersion: 1,
        storeName: 'test-entities',
        schemas,
        indexes: [
          { name: 'name', keyPath: 'name', options: { unique: false } },
          {
            name: 'createdAt',
            keyPath: 'createdAt',
            options: { unique: false },
          },
        ],
      })
    })

    describe('findAll', () => {
      it('returns empty array when no entities exist', async () => {
        const entities = await repository.findAll()
        expect(entities).toEqual([])
      })

      it('returns all entities', async () => {
        const entity1 = await repository.create({ name: 'Entity 1' })
        const entity2 = await repository.create({ name: 'Entity 2' })

        const entities = await repository.findAll()
        expect(entities).toHaveLength(2)
        expect(entities).toContainEqual(entity1)
        expect(entities).toContainEqual(entity2)
      })
    })

    describe('findById', () => {
      it('returns null when entity does not exist', async () => {
        const result = await repository.findById('non-existent-id')
        expect(result).toBeNull()
      })

      it('returns the entity when it exists', async () => {
        const created = await repository.create({ name: 'Test Entity' })
        const found = await repository.findById(created.id)
        expect(found).toEqual(created)
      })
    })

    describe('create', () => {
      it('creates an entity with generated id and timestamps', async () => {
        const input = { name: 'Test Entity' }
        const created = await repository.create(input)

        expect(created.id).toBeDefined()
        expect(created.name).toBe('Test Entity')
        expect(created.createdAt).toBeInstanceOf(Date)
        expect(created.updatedAt).toBeInstanceOf(Date)
        expect(created.createdAt).toEqual(created.updatedAt)
      })

      it('stores and retrieves the entity correctly', async () => {
        const created = await repository.create({ name: 'Test Entity' })
        const retrieved = await repository.findById(created.id)
        expect(retrieved).toEqual(created)
      })

      it.each([
        { name: 'Entity A' },
        { name: 'Entity B' },
        { name: 'Entity C' },
      ])('creates entity with name "$name"', async (input) => {
        const created = await repository.create(input)
        expect(created.name).toBe(input.name)

        const retrieved = await repository.findById(created.id)
        expect(retrieved?.name).toBe(input.name)
      })
    })

    describe('update', () => {
      it('updates an existing entity', async () => {
        const created = await repository.create({ name: 'Original' })

        // Wait a bit to ensure updatedAt is different
        await new Promise((resolve) => setTimeout(resolve, 10))

        const updated = await repository.update(created.id, {
          name: 'Updated',
        })

        expect(updated.id).toBe(created.id)
        expect(updated.name).toBe('Updated')
        expect(updated.createdAt).toEqual(created.createdAt)
        expect(updated.updatedAt.getTime()).toBeGreaterThan(
          created.updatedAt.getTime()
        )
      })

      it('throws error when entity does not exist', async () => {
        await expect(
          repository.update('non-existent-id', { name: 'Updated' })
        ).rejects.toThrow('Entity with id non-existent-id not found')
      })

      it('does not allow changing the id', async () => {
        const created = await repository.create({ name: 'Test' })
        const originalId = created.id

        const updated = await repository.update(created.id, {
          id: 'different-id',
          name: 'Updated',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)

        expect(updated.id).toBe(originalId)
      })

      it('retrieves updated entity correctly', async () => {
        const created = await repository.create({ name: 'Original' })
        await repository.update(created.id, { name: 'Updated' })

        const retrieved = await repository.findById(created.id)
        expect(retrieved?.name).toBe('Updated')
      })
    })

    describe('delete', () => {
      it('deletes an existing entity', async () => {
        const created = await repository.create({ name: 'Test' })

        await repository.delete(created.id)

        const found = await repository.findById(created.id)
        expect(found).toBeNull()
      })

      it('does not throw when deleting non-existent entity', async () => {
        await expect(
          repository.delete('non-existent-id')
        ).resolves.toBeUndefined()
      })

      it('removes entity from findAll results', async () => {
        const entity1 = await repository.create({ name: 'Entity 1' })
        const entity2 = await repository.create({ name: 'Entity 2' })

        await repository.delete(entity1.id)

        const entities = await repository.findAll()
        expect(entities).toHaveLength(1)
        expect(entities).toContainEqual(entity2)
        expect(entities).not.toContainEqual(entity1)
      })
    })

    describe('date serialization', () => {
      it('preserves dates correctly through storage', async () => {
        const created = await repository.create({ name: 'Test' })
        const originalCreatedAt = created.createdAt.getTime()
        const originalUpdatedAt = created.updatedAt.getTime()

        const retrieved = await repository.findById(created.id)

        expect(retrieved?.createdAt.getTime()).toBe(originalCreatedAt)
        expect(retrieved?.updatedAt.getTime()).toBe(originalUpdatedAt)
      })
    })

    describe('schema validation', () => {
      it('rejects invalid create input when schemas are provided', async () => {
        repository = new IndexedDBRepository<TestEntity, CreateTestEntity>({
          dbName: 'test-db',
          dbVersion: 1,
          storeName: 'test-entities',
          schemas: {
            entity: z.object({
              id: z.string(),
              name: z.string().min(2),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
            create: z.object({
              name: z.string().min(2),
            }),
            update: z.object({
              name: z.string().min(2).optional(),
            }),
          },
        })

        await expect(
          repository.create({ name: '' } as CreateTestEntity)
        ).rejects.toThrow()
      })

      it('rejects invalid updates when update schema is provided', async () => {
        repository = new IndexedDBRepository<TestEntity, CreateTestEntity>({
          dbName: 'test-db',
          dbVersion: 1,
          storeName: 'test-entities',
          schemas: {
            entity: z.object({
              id: z.string(),
              name: z.string().min(2),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
            create: z.object({
              name: z.string().min(2),
            }),
            update: z.object({
              name: z.string().min(2).optional(),
            }),
          },
        })

        const created = await repository.create({ name: 'Valid' })

        await expect(
          repository.update(created.id, { name: '' })
        ).rejects.toThrow()
      })
    })
  })
}
