import 'fake-indexeddb/auto'
import { beforeEach, afterEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { clearAllRepositoryCaches } from './shared/repositories/createRepository'
import { cleanup } from '@testing-library/react'

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

/* 📖 # Why cleanup DOM after each test?
 *
 * Tests using happy-dom don't automatically clean up the DOM between tests.
 * Without cleanup, queries like getByRole() may find elements from previous
 * tests, causing "Found multiple elements" errors in CI.
 */
afterEach(() => {
  cleanup()
})
