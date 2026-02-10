// @vitest-environment happy-dom
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  getActiveDatabaseName,
  setDatabaseMode,
  setTemporaryDatabase,
  useDatabaseStore,
} from './databaseStore'
import {
  NOTENBANK_DB_NAME,
  NOTENBANK_EXAMPLE_DB_NAME,
} from '../repositories/notenbankDb'

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

  it('switches to a temporary database', () => {
    setTemporaryDatabase('e2e-1')
    expect(getActiveDatabaseName()).toBe('notenbank-e2e-1')
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

  it('clears temporary state when switching to primary', () => {
    setTemporaryDatabase('e2e-2')
    setDatabaseMode('primary')
    expect(getActiveDatabaseName()).toBe(NOTENBANK_DB_NAME)
  })
})
