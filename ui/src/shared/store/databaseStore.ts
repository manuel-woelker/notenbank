import { createStore } from './jestor'
import {
  NOTENBANK_DB_NAME,
  NOTENBANK_EXAMPLE_DB_NAME,
} from '../repositories/notenbankDb'

export type DatabaseMode = 'primary' | 'example' | 'temporary'

const DATABASE_QUERY_PARAM = 'db'
const EXAMPLE_DB_QUERY_VALUE = 'example'
const DATABASE_NAME_SEPARATOR = '-'

/* 📖 # Why namespace temporary database names with the primary prefix?
Temporary databases come from URL query parameters (e.g. E2E runs). Prefixing
them with the primary DB name prevents accidental collisions with other apps
while keeping related databases grouped together in browser storage.
*/

/* 📖 # Why derive the initial database mode from the URL hash?
The router uses hash-based URLs, so the example database flag lives in the hash
query (`#/path?db=example`). Reading it here ensures stores initialize against
the correct database immediately on reload.
*/
const getInitialDatabaseState = (): DatabaseState => {
  if (typeof window === 'undefined') {
    return {
      mode: 'primary',
    }
  }
  const hash = window.location.hash
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) {
    return {
      mode: 'primary',
    }
  }
  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  const dbParam = params.get(DATABASE_QUERY_PARAM)
  if (!dbParam) {
    return {
      mode: 'primary',
    }
  }
  if (dbParam === EXAMPLE_DB_QUERY_VALUE) {
    return {
      mode: 'example',
    }
  }
  return {
    mode: 'temporary',
    temporaryDbName: `${NOTENBANK_DB_NAME}${DATABASE_NAME_SEPARATOR}${dbParam}`,
  }
}

interface DatabaseState {
  mode: DatabaseMode
  temporaryDbName?: string
}

const databaseStore = createStore<
  DatabaseState,
  Record<string, never>,
  {
    dbName: (state: DatabaseState) => string
    isExample: (state: DatabaseState) => boolean
    isTemporary: (state: DatabaseState) => boolean
  }
>({
  name: 'database',
  initialState: getInitialDatabaseState(),
  derivedState: {
    dbName: (state) => {
      if (state.mode === 'example') {
        return NOTENBANK_EXAMPLE_DB_NAME
      }
      if (state.mode === 'temporary' && state.temporaryDbName) {
        return state.temporaryDbName
      }
      return NOTENBANK_DB_NAME
    },
    isExample: (state) => state.mode === 'example',
    isTemporary: (state) => state.mode === 'temporary',
  },
})

export const setDatabaseMode = (mode: DatabaseMode) => {
  databaseStore.update('database:mode:set', (state) => {
    state.mode = mode
    if (mode !== 'temporary') {
      state.temporaryDbName = undefined
    }
  })
}

export const setTemporaryDatabase = (dbParam: string) => {
  databaseStore.update('database:temporary:set', (state) => {
    state.mode = 'temporary'
    state.temporaryDbName = `${NOTENBANK_DB_NAME}${DATABASE_NAME_SEPARATOR}${dbParam}`
  })
}

export const getActiveDatabaseName = () => databaseStore.getSnapshot().dbName

export const useDatabaseStore = () => {
  const mode = databaseStore.select.mode()
  const dbName = databaseStore.select.dbName()
  const isExample = databaseStore.select.isExample()
  const isTemporary = databaseStore.select.isTemporary()
  return {
    mode,
    dbName,
    isExample,
    isTemporary,
    setDatabaseMode,
    setTemporaryDatabase,
  }
}
