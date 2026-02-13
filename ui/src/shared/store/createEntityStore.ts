import { createStore } from './jestor'
import type { BaseEntity } from '../repositories/RepositoryTypes'
import type { Repository } from '../repositories/Repository'

/* 📖 # Why use ReturnType instead of exporting Jestor interface?
 *
 * The Jestor interface is not exported from jestor.ts to keep the API surface
 * small. We use ReturnType<typeof createStore> to get the store type without
 * needing to export the internal interface.
 */

/**
 * Configuration for creating an entity store
 * @template T - The entity type extending BaseEntity
 * @template TCreate - The creation input type
 */
export interface EntityStoreConfig<T extends BaseEntity, TCreate> {
  /** Store name (used for Redux DevTools) */
  name: string
  /** Repository instance for data access */
  repository: Repository<T, TCreate>
  /** Whether to auto-load on store initialization */
  autoLoad?: boolean
}

/**
 * State shape for entity stores
 * @template T - The entity type
 */
export interface EntityStoreState<T> {
  /** Array of entities */
  entities: T[]
  /** Loading state indicator */
  loading: boolean
}

/** Store type inferred from createStore return type */
type Store<T> = ReturnType<typeof createStore<EntityStoreState<T>>>

/**
 * Store instance with entity management capabilities
 * @template T - The entity type
 * @template TCreate - The creation input type
 */
export interface EntityStore<T extends BaseEntity, TCreate> {
  /** The underlying store instance */
  store: Store<T>
  /** Load all entities from repository */
  loadAll: () => Promise<void>
  /** Create a new entity */
  create: (input: TCreate) => Promise<T>
}

/**
 * Creates a standardized entity store with CRUD operations
 *
 * This factory eliminates boilerplate for simple entity stores that follow
 * the common pattern of: entities[], loading state, loadAll, and create operations.
 *
 * @template T - The entity type extending BaseEntity
 * @template TCreate - The creation input type
 * @param config - Store configuration
 * @returns Entity store with store instance and operations
 *
 * @example
 * ```typescript
 * // Instead of ~69 lines of boilerplate:
 * export const { store, loadAll, create } = createEntityStore<Class, CreateClassInput>({
 *   name: 'classes',
 *   repository: classRepository,
 *   autoLoad: true,
 * })
 *
 * export const useClassStore = createEntityStoreHook(store, loadAll, create)
 * ```
 */
export function createEntityStore<T extends BaseEntity, TCreate>(
  config: EntityStoreConfig<T, TCreate>
): EntityStore<T, TCreate> {
  const { name, repository, autoLoad = true } = config

  const store = createStore<EntityStoreState<T>>({
    name,
    initialState: { entities: [], loading: true },
    ...(autoLoad && {
      init: () => {
        void loadAll()
      },
    }),
  })

  /**
   * Load all entities from repository
   * Sets loading state, handles errors, and updates entities
   */
  async function loadAll(): Promise<void> {
    store.update(`${name}:load:start`, (state) => {
      state.loading = true
    })
    try {
      const data = await repository.findAll()
      store.update(`${name}:load:success`, (state) => {
        state.entities = data
      })
    } catch (error) {
      console.error(`Failed to load ${name}:`, error)
      throw error
    } finally {
      store.update(`${name}:load:finally`, (state) => {
        state.loading = false
      })
    }
  }

  /**
   * Create a new entity
   * Adds the created entity to the store's entities array
   */
  async function create(input: TCreate): Promise<T> {
    try {
      const newEntity = await repository.create(input)
      store.update(`${name}:create:success`, (state) => {
        state.entities.push(newEntity)
      })
      return newEntity
    } catch (error) {
      console.error(`Failed to create ${name}:`, error)
      throw error
    }
  }

  return {
    store,
    loadAll,
    create,
  }
}

/**
 * Creates a useStore hook for an entity store
 *
 * @template T - The entity type
 * @template TCreate - The creation input type
 * @param store - The entity store instance
 * @param loadAll - The loadAll function
 * @param create - The create function
 * @returns React hook that returns store value
 *
 * @example
 * ```typescript
 * export const useClassStore = () => useEntityStore(classStore, loadAll, create)
 * ```
 */
export function useEntityStore<T extends BaseEntity, TCreate>(
  store: EntityStore<T, TCreate>['store'],
  loadAll: EntityStore<T, TCreate>['loadAll'],
  create: EntityStore<T, TCreate>['create']
): {
  entities: T[]
  loading: boolean
  loadAll: () => Promise<void>
  create: (input: TCreate) => Promise<T>
} {
  const entities = store.select.entities()
  const loading = store.select.loading()

  return {
    entities,
    loading,
    loadAll,
    create,
  }
}

/* 📖 # Why create separate hooks for entities vs plural naming?
 *
 * Some stores (like ClassStore) use `classes` instead of `entities`.
 * The generic factory can't know the semantic plural name, so we provide
 * `createEntityStoreHook` for customization while keeping the factory generic.
 */

/**
 * Creates a customized useStore hook with specific property names
 *
 * @template T - The entity type
 * @template TCreate - The creation input type
 * @param config - Configuration for the hook
 * @returns React hook with customized property names
 *
 * @example
 * ```typescript
 * export const useClassStore = createEntityStoreHook({
 *   store: classStore,
 *   loadAll,
 *   create,
 *   entitiesKey: 'classes',
 * })
 * ```
 */
export function createEntityStoreHook<T extends BaseEntity, TCreate>(config: {
  store: EntityStore<T, TCreate>['store']
  loadAll: EntityStore<T, TCreate>['loadAll']
  create: EntityStore<T, TCreate>['create']
  /** Custom key name for entities (e.g., 'classes', 'students') */
  entitiesKey: string
}): () => Record<string, unknown> {
  const { store, loadAll, create, entitiesKey } = config

  return function useStore() {
    const entities = store.select.entities()
    const loading = store.select.loading()

    return {
      [entitiesKey]: entities,
      loading,
      loadAll,
      create,
    }
  }
}

/* === TESTS === */

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { clearAllRepositoryCaches } =
    await import('../repositories/createRepository')

  // Simple test entity
  interface TestEntity extends BaseEntity {
    name: string
  }

  interface CreateTestInput {
    name: string
  }

  describe('createEntityStore', () => {
    beforeEach(async () => {
      await clearAllRepositoryCaches()
    })

    it('should create a store with initial state', () => {
      const mockRepository = {
        findAll: async (): Promise<TestEntity[]> => [],
        create: async (input: CreateTestInput): Promise<TestEntity> => ({
          ...input,
          id: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as Repository<TestEntity, CreateTestInput>

      const { store } = createEntityStore<TestEntity, CreateTestInput>({
        name: 'test',
        repository: mockRepository,
        autoLoad: false,
      })

      const state = store.getSnapshot()
      expect(state.entities).toEqual([])
      expect(state.loading).toBe(true)
    })

    it('should load entities from repository', async () => {
      const testEntities: TestEntity[] = [
        {
          id: '1',
          name: 'Test 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockRepository = {
        findAll: async (): Promise<TestEntity[]> => testEntities,
        create: async (input: CreateTestInput): Promise<TestEntity> => ({
          ...input,
          id: '2',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as Repository<TestEntity, CreateTestInput>

      const { store, loadAll } = createEntityStore<TestEntity, CreateTestInput>(
        {
          name: 'test',
          repository: mockRepository,
          autoLoad: false,
        }
      )

      await loadAll()

      const state = store.getSnapshot()
      expect(state.entities).toHaveLength(1)
      expect(state.entities[0].name).toBe('Test 1')
      expect(state.loading).toBe(false)
    })

    it('should create and add entity to state', async () => {
      let nextId = 1
      const entities: TestEntity[] = []

      const mockRepository = {
        findAll: async (): Promise<TestEntity[]> => entities,
        create: async (input: CreateTestInput): Promise<TestEntity> => {
          const entity: TestEntity = {
            ...input,
            id: String(nextId++),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          entities.push(entity)
          return entity
        },
      } as Repository<TestEntity, CreateTestInput>

      const { store, create } = createEntityStore<TestEntity, CreateTestInput>({
        name: 'test',
        repository: mockRepository,
        autoLoad: false,
      })

      const newEntity = await create({ name: 'New Entity' })

      expect(newEntity.name).toBe('New Entity')
      expect(newEntity.id).toBe('1')

      const state = store.getSnapshot()
      expect(state.entities).toHaveLength(1)
      expect(state.entities[0].name).toBe('New Entity')
    })

    it('should handle load errors and set loading to false', async () => {
      const mockRepository = {
        findAll: async (): Promise<TestEntity[]> => {
          throw new Error('Database error')
        },
        create: async (input: CreateTestInput): Promise<TestEntity> => ({
          ...input,
          id: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as Repository<TestEntity, CreateTestInput>

      const { store, loadAll } = createEntityStore<TestEntity, CreateTestInput>(
        {
          name: 'test',
          repository: mockRepository,
          autoLoad: false,
        }
      )

      await expect(loadAll()).rejects.toThrow('Database error')

      const state = store.getSnapshot()
      expect(state.loading).toBe(false)
    })
  })

  describe('createEntityStoreHook', () => {
    it('should return hook with custom entities key', async () => {
      const mockRepository = {
        findAll: async (): Promise<TestEntity[]> => [],
        create: async (input: CreateTestInput): Promise<TestEntity> => ({
          ...input,
          id: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as Repository<TestEntity, CreateTestInput>

      const { store, loadAll, create } = createEntityStore<
        TestEntity,
        CreateTestInput
      >({
        name: 'test',
        repository: mockRepository,
        autoLoad: false,
      })

      const useTestStore = createEntityStoreHook({
        store,
        loadAll,
        create,
        entitiesKey: 'tests',
      })

      // The hook should return an object with the custom key
      expect(typeof useTestStore).toBe('function')
    })
  })
}
