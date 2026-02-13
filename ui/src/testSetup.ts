import 'fake-indexeddb/auto'
import { beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { clearAllRepositoryCaches } from './shared/repositories/createRepository'

/* 📖 # Why reset IndexedDB globally before each test?
 *
 * TinyBase's IndexedDB persister caches connections to the underlying storage.
 * Creating a fresh IDBFactory gives a completely clean in-memory IndexedDB,
 * and clearAllRepositoryCaches ensures TinyBase's store and persister caches
 * are properly cleared so repositories reconnect to the fresh database.
 */
beforeEach(async () => {
  await clearAllRepositoryCaches()
  globalThis.indexedDB = new IDBFactory()
})
