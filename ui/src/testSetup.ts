import 'fake-indexeddb/auto'
import { beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { clearAllRepositoryCaches } from './shared/repositories/createRepository'

/* 📖 # Why reset IndexedDB globally before each test?
 *
 * RxDB uses Dexie internally, which caches IndexedDB schema metadata.
 * After db.remove(), Dexie's internal state can become stale, causing
 * errors when re-creating databases with the same name. Creating a fresh
 * IDBFactory gives a completely clean in-memory IndexedDB, and
 * clearAllRepositoryCaches ensures RxDB's internal caches are also reset.
 */
beforeEach(async () => {
  await clearAllRepositoryCaches()
  globalThis.indexedDB = new IDBFactory()
})
