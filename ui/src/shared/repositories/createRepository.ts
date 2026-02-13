import { BaseEntity, CreateInput } from './RepositoryTypes'
import { Repository, RepositorySchemas } from './Repository'
import { type RepositoryConfig } from './IndexedDBRepository'
import { RxDBRepository, destroyAllRxDatabases } from './RxDBRepository'

/* 📖 # Why is inTransaction a no-op shim?
 *
 * RxDB manages transactions internally. The export is kept for API
 * compatibility but no callers depend on it (confirmed by grep).
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
 * RxDB database instances must be destroyed (connections closed) before
 * clearing the repository instance maps, otherwise stale connections
 * would leak. The await ensures all databases are properly shut down
 * before repositories are recreated on next access.
 */
export async function clearAllRepositoryCaches() {
  await destroyAllRxDatabases()
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
  const instances = new Map<string, RxDBRepository<T, TCreate>>()

  const resolveDbName = () => (typeof dbName === 'function' ? dbName() : dbName)

  const ensureInstance = () => {
    const resolvedDbName = resolveDbName()
    const cached = instances.get(resolvedDbName)
    if (cached) {
      return cached
    }
    const created = new RxDBRepository<T, TCreate>({
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
