import { BaseEntity, CreateInput } from './RepositoryTypes'
import { Repository, RepositorySchemas } from './Repository'
import {
  IndexedDBRepository,
  RepositoryConfig,
  inTransaction as inTransactionImpl,
} from './IndexedDBRepository'

/* 📖 # Why re-export inTransaction?
 *
 * Consumers should be able to use transaction batching without importing
 * directly from IndexedDBRepository. This keeps the repository abstraction
 * clean while exposing the performance optimization where needed.
 */
export { inTransactionImpl as inTransaction }

type RepositoryConfigWithDynamicDb<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
> = Omit<RepositoryConfig<T, TCreate>, 'dbName'> & {
  dbName: string | (() => string)
}

type CacheClearer = () => void

const repositoryCacheClearers: CacheClearer[] = []

/* 📖 # Why do we need a global cache registry?
 *
 * When `resetExampleDatabase()` deletes and recreates the IndexedDB database,
 * all repository instances still hold references to the old (closed) database
 * connection. We need a way to clear all cached instances so they can be
 * recreated with fresh connections to the new database.
 */
export function clearAllRepositoryCaches() {
  repositoryCacheClearers.forEach((clearer) => clearer())
}

/* 📖 # Why use a lazy getter singleton pattern?
 *
 * IndexedDB initialization during module import can cause issues in test environments
 * where `indexedDB` needs to be mocked before repository creation.
 *
 * By using getter methods that lazily instantiate the repository on first access,
 * we allow tests to set up `fake-indexeddb` before any IndexedDB operations occur.
 *
 * This pattern matches the existing ClassRepository implementation and ensures
 * backward compatibility.
 */

/**
 * Create a repository instance with lazy singleton pattern
 *
 * @template T - The entity type (must extend BaseEntity)
 * @template TCreate - The creation input type (defaults to CreateInput<T>)
 * @param config - Repository configuration
 * @returns Repository instance with lazy initialization
 *
 * @example
 * ```typescript
 * export const classRepository = createRepository<Class, CreateClassInput>({
 *   dbName: 'notenbank',
 *   dbVersion: 1,
 *   storeName: 'classes',
 *   schemas: {
 *     entity: z.object({
 *       id: z.string(),
 *       name: z.string().min(1),
 *       createdAt: z.date(),
 *       updatedAt: z.date(),
 *     }),
 *     create: z.object({
 *       name: z.string().min(1),
 *     }),
 *     update: z.object({
 *       name: z.string().min(1).optional(),
 *     }),
 *   },
 *   indexes: [
 *     { name: 'name', keyPath: 'name', options: { unique: false } },
 *   ],
 * })
 * ```
 */
export function createRepository<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
>(config: RepositoryConfigWithDynamicDb<T, TCreate>): Repository<T, TCreate> {
  const schemas = config.schemas satisfies RepositorySchemas<T, TCreate>
  const { dbName, ...restConfig } = config
  const instances = new Map<string, IndexedDBRepository<T, TCreate>>()

  const resolveDbName = () => (typeof dbName === 'function' ? dbName() : dbName)

  const ensureInstance = () => {
    const resolvedDbName = resolveDbName()
    const cached = instances.get(resolvedDbName)
    if (cached) {
      return cached
    }
    const created = new IndexedDBRepository<T, TCreate>({
      ...restConfig,
      dbName: resolvedDbName,
    })
    instances.set(resolvedDbName, created)
    return created
  }

  // Register this repository's cache clearer
  repositoryCacheClearers.push(() => {
    instances.clear()
  })

  return {
    schemas,
    get findAll() {
      return ensureInstance().findAll.bind(ensureInstance())
    },
    get findById() {
      return ensureInstance().findById.bind(ensureInstance())
    },
    get create() {
      return ensureInstance().create.bind(ensureInstance())
    },
    get update() {
      return ensureInstance().update.bind(ensureInstance())
    },
    get delete() {
      return ensureInstance().delete.bind(ensureInstance())
    },
  }
}
