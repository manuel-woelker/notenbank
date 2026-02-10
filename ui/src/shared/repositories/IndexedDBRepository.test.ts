import { beforeEach, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { z } from 'zod'
import type { BaseEntity, CreateInput } from './RepositoryTypes'
import { IndexedDBRepository } from './IndexedDBRepository'

const DATABASE_METADATA_STORE = 'dbMetadata'
const DATABASE_CREATED_AT_KEY = 'createdAt'

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

    it.each([{ name: 'Entity A' }, { name: 'Entity B' }, { name: 'Entity C' }])(
      'creates entity with name "$name"',
      async (input) => {
        const created = await repository.create(input)
        expect(created.name).toBe(input.name)

        const retrieved = await repository.findById(created.id)
        expect(retrieved?.name).toBe(input.name)
      }
    )
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

  describe('database metadata', () => {
    const openDatabase = (dbName: string) =>
      new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

    const loadMetadata = (db: IDBDatabase) =>
      new Promise<{ key: string; value: string } | undefined>(
        (resolve, reject) => {
          const transaction = db.transaction(
            DATABASE_METADATA_STORE,
            'readonly'
          )
          const store = transaction.objectStore(DATABASE_METADATA_STORE)
          const request = store.get(DATABASE_CREATED_AT_KEY)
          request.onsuccess = () =>
            resolve(
              request.result as { key: string; value: string } | undefined
            )
          request.onerror = () => reject(request.error)
        }
      )

    it('stores creation date metadata in ISO8601 format', async () => {
      await repository.findAll()

      const db = await openDatabase('test-db')
      const metadata = await loadMetadata(db)
      db.close()

      expect(metadata?.key).toBe(DATABASE_CREATED_AT_KEY)
      expect(metadata?.value).toBeDefined()
      expect(new Date(metadata?.value ?? '').toISOString()).toBe(
        metadata?.value
      )
    })
  })
})
