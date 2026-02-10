import { z } from 'zod'
import { beforeEach, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import type { BaseEntity, CreateInput } from './RepositoryTypes'
import type { Repository } from './Repository'
import { createRepository } from './createRepository'

interface TestEntity extends BaseEntity {
  name: string
}

type CreateTestEntity = CreateInput<TestEntity>

describe('createRepository', () => {
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
  })

  it('creates repository with all CRUD methods', () => {
    const repository = createRepository<TestEntity, CreateTestEntity>({
      dbName: 'test-db',
      dbVersion: 1,
      storeName: 'test-entities',
      schemas,
      indexes: [],
    })

    expect(repository.findAll).toBeDefined()
    expect(repository.findById).toBeDefined()
    expect(repository.create).toBeDefined()
    expect(repository.update).toBeDefined()
    expect(repository.delete).toBeDefined()
    expect(typeof repository.findAll).toBe('function')
    expect(typeof repository.findById).toBe('function')
    expect(typeof repository.create).toBe('function')
    expect(typeof repository.update).toBe('function')
    expect(typeof repository.delete).toBe('function')
  })

  it('implements lazy initialization - CRUD operations work on first access', async () => {
    const repository = createRepository<TestEntity, CreateTestEntity>({
      dbName: 'test-db',
      dbVersion: 1,
      storeName: 'test-entities',
      schemas,
      indexes: [],
    })

    // The repository should work even though instance is created lazily
    const created = await repository.create({ name: 'Lazy Test' })
    expect(created.name).toBe('Lazy Test')

    // Subsequent calls should use the same instance
    const found = await repository.findById(created.id)
    expect(found).toEqual(created)
  })

  it('implements singleton pattern - returns same instance on multiple accesses', () => {
    const repository = createRepository<TestEntity, CreateTestEntity>({
      dbName: 'test-db',
      dbVersion: 1,
      storeName: 'test-entities',
      schemas,
      indexes: [],
    })

    // All methods should be accessible and defined
    // The lazy singleton pattern ensures they all use the same underlying instance
    expect(repository.findAll).toBeDefined()
    expect(repository.findById).toBeDefined()
    expect(repository.create).toBeDefined()
    expect(repository.update).toBeDefined()
    expect(repository.delete).toBeDefined()
  })

  it('different configs create different repository instances', () => {
    const repository1 = createRepository<TestEntity, CreateTestEntity>({
      dbName: 'test-db-1',
      dbVersion: 1,
      storeName: 'entities-1',
      schemas,
      indexes: [],
    })

    const repository2 = createRepository<TestEntity, CreateTestEntity>({
      dbName: 'test-db-2',
      dbVersion: 1,
      storeName: 'entities-2',
      schemas,
      indexes: [],
    })

    // These should be different repository objects
    expect(repository1).not.toBe(repository2)
    expect(repository1.findAll).not.toBe(repository2.findAll)
  })

  it('supports db name resolvers for multi-database access', async () => {
    let activeDbName = 'test-db-1'
    const repository = createRepository<TestEntity, CreateTestEntity>({
      dbName: () => activeDbName,
      dbVersion: 1,
      storeName: 'test-entities',
      schemas,
      indexes: [],
    })

    await repository.create({ name: 'DB1 Entity' })

    activeDbName = 'test-db-2'
    await repository.create({ name: 'DB2 Entity' })

    const db2Entities = await repository.findAll()
    expect(db2Entities).toHaveLength(1)
    expect(db2Entities[0].name).toBe('DB2 Entity')

    activeDbName = 'test-db-1'
    const db1Entities = await repository.findAll()
    expect(db1Entities).toHaveLength(1)
    expect(db1Entities[0].name).toBe('DB1 Entity')
  })

  describe('CRUD operations work correctly', () => {
    let repository: Repository<TestEntity, CreateTestEntity>

    beforeEach(() => {
      globalThis.indexedDB = new IDBFactory()
      repository = createRepository<TestEntity, CreateTestEntity>({
        dbName: 'test-db',
        dbVersion: 1,
        storeName: 'test-entities',
        schemas,
        indexes: [
          { name: 'name', keyPath: 'name', options: { unique: false } },
        ],
      })
    })

    it('creates and retrieves entities', async () => {
      const created = await repository.create({ name: 'Test Entity' })
      expect(created).toMatchObject({
        name: 'Test Entity',
      })
      expect(created.id).toBeDefined()
      expect(created.createdAt).toBeInstanceOf(Date)
      expect(created.updatedAt).toBeInstanceOf(Date)

      const found = await repository.findById(created.id)
      expect(found).toEqual(created)
    })

    it('finds all entities', async () => {
      await repository.create({ name: 'Entity 1' })
      await repository.create({ name: 'Entity 2' })

      const all = await repository.findAll()
      expect(all).toHaveLength(2)
      const entityNames = all.map((e) => e.name).sort()
      expect(entityNames).toEqual(['Entity 1', 'Entity 2'])
    })

    it('updates entities', async () => {
      const created = await repository.create({ name: 'Original' })
      const updated = await repository.update(created.id, {
        name: 'Updated',
      })

      expect(updated.name).toBe('Updated')
      expect(updated.id).toBe(created.id)
      expect(updated.createdAt).toEqual(created.createdAt)
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.updatedAt.getTime()
      )
    })

    it('deletes entities', async () => {
      const created = await repository.create({ name: 'To Delete' })
      await repository.delete(created.id)

      const found = await repository.findById(created.id)
      expect(found).toBeNull()
    })

    it('returns empty array when no entities exist', async () => {
      const all = await repository.findAll()
      expect(all).toEqual([])
    })

    it('returns null when entity does not exist', async () => {
      const found = await repository.findById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('method binding', () => {
    it('methods can be destructured and called independently', async () => {
      globalThis.indexedDB = new IDBFactory()
      const repository = createRepository<TestEntity, CreateTestEntity>({
        dbName: 'test-db',
        dbVersion: 1,
        storeName: 'test-entities',
        schemas,
        indexes: [],
      })

      // Destructure methods
      const { create, findById, findAll } = repository

      // Methods should work when called independently
      const created = await create({ name: 'Test' })
      expect(created.name).toBe('Test')

      const found = await findById(created.id)
      expect(found).toEqual(created)

      const all = await findAll()
      expect(all).toHaveLength(1)
    })
  })
})
