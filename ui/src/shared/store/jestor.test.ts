import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStore } from './jestor'

describe('createStore', () => {
  let originalWindow: unknown

  beforeEach(() => {
    originalWindow = (globalThis as { window?: unknown }).window
  })

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as { window?: unknown }).window
    } else {
      ;(globalThis as { window?: unknown }).window = originalWindow
    }
  })

  it('updates base and derived state', () => {
    const store = createStore<
      { count: number },
      Record<string, never>,
      { doubled: (state: { count: number }) => number }
    >({
      name: 'test',
      initialState: { count: 0 },
      derivedState: {
        doubled: (state) => state.count * 2,
      },
    })

    expect(store.getSnapshot()).toEqual({ count: 0, doubled: 0 })

    store.update('inc', (state) => {
      state.count += 1
    })

    expect(store.getSnapshot()).toEqual({ count: 1, doubled: 2 })
  })

  it('dispatches actions and triggers', () => {
    const store = createStore<
      { count: number },
      { add: (state: { count: number }, amount: unknown) => void }
    >({
      name: 'actions',
      initialState: { count: 0 },
      actions: {
        add(state, amount) {
          state.count += amount as number
        },
      },
    })

    store.dispatch.add(3)
    expect(store.getSnapshot().count).toBe(3)

    const trigger = store.trigger.add(2)
    trigger()
    expect(store.getSnapshot().count).toBe(5)
  })

  it('notifies subscribers and supports unsubscribe', () => {
    const store = createStore({
      name: 'subs',
      initialState: { count: 0 },
    })

    const callback = vi.fn()
    const unsubscribe = store.subscribe(callback)

    store.update('inc', (state) => {
      state.count += 1
    })

    expect(callback).toHaveBeenCalledTimes(1)

    unsubscribe()

    store.update('inc', (state) => {
      state.count += 1
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('integrates with Redux DevTools when available', () => {
    const init = vi.fn()
    const send = vi.fn()
    ;(globalThis as { window?: unknown }).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect: () => ({
          init,
          send,
        }),
      },
    }

    const store = createStore({
      name: 'devtools',
      initialState: { count: 0 },
    })

    expect(init).toHaveBeenCalledWith({ count: 0 })
    expect(send).toHaveBeenCalledWith({ type: '@@DERIVED_STATE' }, { count: 0 })

    store.update('inc', (state) => {
      state.count += 1
    })

    expect(send).toHaveBeenCalledWith({ type: 'inc' }, { count: 1 })
  })

  it('exposes selectors for base and derived state keys', () => {
    const store = createStore<
      { count: number },
      Record<string, never>,
      { doubled: (state: { count: number }) => number }
    >({
      name: 'selectors',
      initialState: { count: 0 },
      derivedState: {
        doubled: (state) => state.count * 2,
      },
    })

    expect(typeof store.select.count).toBe('function')
    expect(typeof store.select.doubled).toBe('function')
  })
})
