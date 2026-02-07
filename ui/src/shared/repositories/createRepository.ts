import { BaseEntity, CreateInput } from './types'
import { Repository } from './Repository'
import { IndexedDBRepository, RepositoryConfig } from './IndexedDBRepository'

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
 *   indexes: [
 *     { name: 'name', keyPath: 'name', options: { unique: false } },
 *   ],
 * })
 * ```
 */
export function createRepository<
  T extends BaseEntity,
  TCreate = CreateInput<T>,
>(config: RepositoryConfig<T, never>): Repository<T, TCreate> {
  let instance: IndexedDBRepository<T, TCreate> | null = null

  const ensureInstance = () => {
    if (!instance) {
      instance = new IndexedDBRepository<T, TCreate>(config)
    }
    return instance
  }

  return {
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
