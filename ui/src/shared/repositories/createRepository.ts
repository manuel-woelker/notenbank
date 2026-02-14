import { BaseEntity, CreateInput } from './RepositoryTypes'
import { Repository, RepositorySchemas } from './Repository'
import {
  TinyBaseRepository,
  destroyAllTinyBaseStores,
  type RepositoryConfig,
  type IndexConfig,
} from './TinyBaseRepository'
import { resetAllJestorStores } from '../store/jestor'

/* 📖 # Why is inTransaction a no-op shim?
 *
 * TinyBase manages transactions internally via store.transaction().
 * The export is kept for API compatibility but no callers depend on it.
 */
export async function inTransaction<T>(
  _dbName: string,
  _storeNames: string[],
  _mode: IDBTransactionMode,
  fn: () => Promise<T>
): Promise<T> {
  return fn()
}

type RepositoryConfigWithDynamicDb<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
> = Omit<RepositoryConfig<T, TCreate>, 'dbName'> & {
  dbName: string | (() => string)
}

type CacheClearer = () => void

const repositoryCacheClearers: CacheClearer[] = []

/* 📖 # Why is clearAllRepositoryCaches async?
 *
 * TinyBase persisters must be stopped and destroyed before clearing the cache,
 * otherwise auto-save subscriptions would leak. The await ensures all
 * persisters are properly shut down before repositories are recreated.
 */
export async function clearAllRepositoryCaches() {
  resetAllJestorStores()
  await destroyAllTinyBaseStores()
  repositoryCacheClearers.forEach((clearer) => clearer())
}

/* 📖 # Why use a lazy getter singleton pattern?
 *
 * Repository initialization during module import can cause issues in test
 * environments where `indexedDB` needs to be mocked before repository creation.
 *
 * By using getter methods that lazily instantiate the repository on first access,
 * we allow tests to set up `fake-indexeddb` before any database operations occur.
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
  const instances = new Map<string, TinyBaseRepository<T, TCreate>>()

  const resolveDbName = () => (typeof dbName === 'function' ? dbName() : dbName)

  const ensureInstance = () => {
    const resolvedDbName = resolveDbName()
    const cached = instances.get(resolvedDbName)
    if (cached) {
      return cached
    }
    const created = new TinyBaseRepository<T, TCreate>({
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
    get createMultiple() {
      return ensureInstance().createMultiple.bind(ensureInstance())
    },
    get update() {
      return ensureInstance().update.bind(ensureInstance())
    },
    get delete() {
      return ensureInstance().delete.bind(ensureInstance())
    },
  }
}

export type { RepositoryConfig, IndexConfig }
