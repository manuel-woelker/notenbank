import { createStore } from './jestor'
import {
  NOTENBANK_DB_NAME,
  NOTENBANK_EXAMPLE_DB_NAME,
} from '../repositories/notenbankDb'

export type DatabaseMode = 'primary' | 'example'

const EXAMPLE_DB_QUERY_PARAM = 'db'
const EXAMPLE_DB_QUERY_VALUE = 'example'

/* 📖 # Why derive the initial database mode from the URL hash?
The router uses hash-based URLs, so the example database flag lives in the hash
query (`#/path?db=example`). Reading it here ensures stores initialize against
the correct database immediately on reload.
*/
const getInitialDatabaseMode = (): DatabaseMode => {
  if (typeof window === 'undefined') {
    return 'primary'
  }
  const hash = window.location.hash
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) {
    return 'primary'
  }
  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  return params.get(EXAMPLE_DB_QUERY_PARAM) === EXAMPLE_DB_QUERY_VALUE
    ? 'example'
    : 'primary'
}

interface DatabaseState {
  mode: DatabaseMode
}

const databaseStore = createStore<
  DatabaseState,
  Record<string, never>,
  {
    dbName: (state: DatabaseState) => string
    isExample: (state: DatabaseState) => boolean
  }
>({
  name: 'database',
  initialState: {
    mode: getInitialDatabaseMode(),
  },
  derivedState: {
    dbName: (state) =>
      state.mode === 'example' ? NOTENBANK_EXAMPLE_DB_NAME : NOTENBANK_DB_NAME,
    isExample: (state) => state.mode === 'example',
  },
})

export const setDatabaseMode = (mode: DatabaseMode) => {
  databaseStore.update('database:mode:set', (state) => {
    state.mode = mode
  })
}

export const getActiveDatabaseName = () => databaseStore.getSnapshot().dbName

export const useDatabaseStore = () => {
  const mode = databaseStore.select.mode()
  const dbName = databaseStore.select.dbName()
  const isExample = databaseStore.select.isExample()
  return {
    mode,
    dbName,
    isExample,
    setDatabaseMode,
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest
  const { renderHook, act } = await import('@testing-library/react')

  describe('databaseStore', () => {
    beforeEach(() => {
      setDatabaseMode('primary')
    })

    it('defaults to the primary database', () => {
      expect(getActiveDatabaseName()).toBe(NOTENBANK_DB_NAME)
    })

    it('switches to the example database', () => {
      setDatabaseMode('example')
      expect(getActiveDatabaseName()).toBe(NOTENBANK_EXAMPLE_DB_NAME)
    })

    it('exposes example state via the hook', () => {
      const { result } = renderHook(() => useDatabaseStore())

      expect(result.current.isExample).toBe(false)

      act(() => {
        setDatabaseMode('example')
      })

      expect(result.current.isExample).toBe(true)
      expect(result.current.dbName).toBe(NOTENBANK_EXAMPLE_DB_NAME)
    })
  })
}
