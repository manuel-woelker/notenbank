import * as React from 'react'
import { produce } from 'immer'

interface ReduxDevTools {
  init: (state: unknown) => void
  send: (action: unknown, state: unknown) => void
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: (options: { name: string; instanceId: string }) => ReduxDevTools
    }
  }
}

/**
 * Core store interface that provides state management capabilities
 * @template STATE - The shape of the application state
 * @template ACTIONS - Type defining the available actions
 * @template STATE_DERIVATIONS - Type defining derived state values
 */
interface Jestor<
  STATE,
  ACTIONS extends ActionDefinitions<STATE>,
  STATE_DERIVATIONS extends StateDerivations<STATE>,
> {
  init: () => void
  useState: () => CombinedState<STATE, STATE_DERIVATIONS>
  getSnapshot: () => CombinedState<STATE, STATE_DERIVATIONS>
  update: (label: string, fn: (state: STATE) => void) => void
  dispatch: ActionDispatchers<STATE, ACTIONS>
  trigger: ActionTriggerMakers<STATE, ACTIONS>
  select: Selectors<CombinedState<STATE, STATE_DERIVATIONS>>
  subscribe: (callback: () => void) => () => void
}

/**
 * Combines base state with derived state
 * @template STATE - The base state type
 * @template STATE_DERIVATIONS - Type of derived state functions
 */
type CombinedState<
  STATE,
  STATE_DERIVATIONS extends StateDerivations<STATE>,
> = STATE & DerivedState<STATE, STATE_DERIVATIONS>

/**
 * Defines an action function that can modify the state
 * @template STATE - The state type
 * @template PARAMETERS - Tuple type of action parameters
 */
type ActionDefinition<STATE, PARAMETERS extends readonly unknown[]> = (
  state: STATE,
  ...parameters: PARAMETERS
) => void
/**
 * Object mapping action names to their implementations
 * @template STATE - The state type
 */
type ActionDefinitions<STATE> = {
  [key: string]: ActionDefinition<STATE, readonly unknown[]>
}

/**
 * Function type for dispatching an action
 * @template PARAMETERS - Tuple type of action parameters
 */
type ActionDispatcher<PARAMETERS extends readonly unknown[]> = (
  ...parameters: PARAMETERS
) => void
/**
 * Maps action names to their corresponding dispatcher functions
 * @template STATE - The state type
 * @template ACTIONS - Type containing action definitions
 */
type ActionDispatchers<STATE, ACTIONS extends ActionDefinitions<STATE>> = {
  [K in keyof ACTIONS]: ActionDispatcher<TailArguments<ACTIONS[K]>>
}

/**
 * Creates an action trigger function for event handlers
 * @template PARAMETERS - Tuple type of action parameters
 */
type ActionTriggerMaker<PARAMETERS extends readonly unknown[]> = (
  ...parameters: PARAMETERS
) => () => void
/**
 * Maps action names to their corresponding trigger maker functions
 * @template STATE - The state type
 * @template ACTIONS - Type containing action definitions
 */
type ActionTriggerMakers<STATE, ACTIONS extends ActionDefinitions<STATE>> = {
  [K in keyof ACTIONS]: ActionTriggerMaker<TailArguments<ACTIONS[K]>>
}

/**
 * Function that selects a value from the state
 * @template T - Type of the selected value
 */
type Selector<T> = () => T
/**
 * Maps state properties to their selector functions
 * @template STATE - The state type
 */
type Selectors<STATE> = {
  [K in keyof STATE]: Selector<STATE[K]>
}

type ReturnTypeOfFunction<F> = F extends (...args: infer _Args) => infer R
  ? R
  : never
/**
 * Function that derives a value from the state
 * @template STATE - The state type
 * @template R - The type of the derived value
 */
type StateDerivation<STATE, R> = (state: STATE) => R
/**
 * Maps derived state property names to their derivation functions
 * @template STATE - The state type
 */
type StateDerivations<STATE> = {
  [key: string]: StateDerivation<STATE, unknown>
}

/**
 * Type representing the derived state object
 * @template STATE - The state type
 * @template STATE_DERIVATIONS - Type containing derivation functions
 */
type DerivedState<STATE, STATE_DERIVATIONS extends StateDerivations<STATE>> = {
  [K in keyof STATE_DERIVATIONS]: ReturnTypeOfFunction<STATE_DERIVATIONS[K]>
}

/**
 * Creates a new state store with the given configuration
 * @template STATE - The shape of the application state
 * @template ACTIONS - Type defining the available actions
 * @template STATE_DERIVATIONS - Type defining derived state values
 * @param init - Configuration object for the store
 * @param init.name - Name of the store (used for devtools)
 * @param init.initialState - The initial state of the store
 * @param [init.actions] - Optional actions that can modify the state
 * @param [init.derivedState] - Optional derived state functions
 * @returns A configured store instance
 * @example
 * const store = createStore({
 *   name: 'classes',
 *   initialState: { count: 0 },
 *   actions: {
 *     add(state, amount: number) {
 *       state.count += amount
 *     },
 *   },
 *   derivedState: {
 *     doubled: (state) => state.count * 2,
 *   },
 * })
 *
 * store.dispatch.add(1)
 * const state = store.useState()
 * const count = store.select.count()
 * const doubled = store.select.doubled()
 * const onClick = store.trigger.add(1)
 */
export function createStore<
  STATE,
  ACTIONS extends ActionDefinitions<STATE> = Record<string, never>,
  STATE_DERIVATIONS extends StateDerivations<STATE> = Record<string, never>,
>(init: {
  name: string
  initialState: STATE
  derivedState?: STATE_DERIVATIONS
  actions?: ACTIONS
  init?: () => void
}): Jestor<STATE, ACTIONS, STATE_DERIVATIONS> {
  type FullState = CombinedState<STATE, STATE_DERIVATIONS>
  let devTools: ReduxDevTools | null = null
  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
      name: init.name,
      instanceId: init.name,
    })
    devTools.init(init.initialState)
  }
  let baseState = init.initialState
  let subscribers: (() => void)[] = []

  function computeDerivedState(): DerivedState<STATE, STATE_DERIVATIONS> {
    const derivedState: DerivedState<STATE, STATE_DERIVATIONS> =
      {} as DerivedState<STATE, STATE_DERIVATIONS>
    if (init.derivedState) {
      const derivations = init.derivedState
      for (const key in derivations) {
        const derivationKey = key as keyof STATE_DERIVATIONS
        const derivedValue = derivations[derivationKey](
          baseState
        ) as ReturnTypeOfFunction<STATE_DERIVATIONS[typeof derivationKey]>
        derivedState[derivationKey] = derivedValue
      }
    }
    return derivedState
  }

  let derivedState: DerivedState<STATE, STATE_DERIVATIONS> = {} as DerivedState<
    STATE,
    STATE_DERIVATIONS
  >

  let combinedState: FullState = {} as FullState

  function updateCombinedState() {
    derivedState = computeDerivedState()
    combinedState = { ...baseState, ...derivedState }
  }

  updateCombinedState()
  devTools?.send({ type: '@@DERIVED_STATE' }, combinedState)

  function subscribe(callback: () => void) {
    subscribers.push(callback)
    return () => {
      subscribers = subscribers.filter((sub) => sub !== callback)
    }
  }

  function update(label: string, fn: (state: STATE) => void): void {
    updateInternal(fn, { type: label })
  }

  function updateInternal(fn: (state: STATE) => void, devInfo: unknown): void {
    baseState = produce(baseState, fn)
    updateCombinedState()
    subscribers.forEach((sub) => sub())
    devTools?.send(devInfo, combinedState)
  }

  let hasInitialized = false
  /* 📖 # Why provide a store init hook?
  Some stores load data lazily. An init hook lets the store trigger that work
  the first time a component subscribes, without needing a wrapper provider.
  */
  function runInit() {
    if (hasInitialized) {
      return
    }
    hasInitialized = true
    init.init?.()
  }

  function applyAction<PARAMETERS extends readonly unknown[]>(
    name: string,
    actionDefinition: ActionDefinition<STATE, PARAMETERS>,
    parameters: PARAMETERS
  ): void {
    updateInternal((draft: STATE) => actionDefinition(draft, ...parameters), {
      type: name,
      parameters,
    })
  }

  function getSnapshot(): FullState {
    return combinedState
  }

  function createActionDispatcher<PARAMETERS extends readonly unknown[]>(
    name: string,
    actionDefinition: ActionDefinition<STATE, PARAMETERS>
  ): ActionDispatcher<PARAMETERS> {
    return (...parameters: PARAMETERS) => {
      applyAction(name, actionDefinition, parameters)
    }
  }

  function createActionTriggerMaker<PARAMETERS extends readonly unknown[]>(
    name: string,
    actionDefinition: ActionDefinition<STATE, PARAMETERS>
  ): ActionTriggerMaker<PARAMETERS> {
    return (...parameters: PARAMETERS) => {
      return () => {
        applyAction(name, actionDefinition, parameters)
      }
    }
  }

  const actionDispatchers: ActionDispatchers<STATE, ACTIONS> =
    {} as ActionDispatchers<STATE, ACTIONS>
  const actionTriggerMakers: ActionTriggerMakers<STATE, ACTIONS> =
    {} as ActionTriggerMakers<STATE, ACTIONS>
  const actions = init.actions
  if (actions) {
    for (const actionName in actions) {
      actionDispatchers[actionName] = createActionDispatcher(
        actionName,
        actions[actionName]
      )
      actionTriggerMakers[actionName] = createActionTriggerMaker(
        actionName,
        actions[actionName]
      )
    }
  }

  /* 📖 # Why use useSyncExternalStore for the store and selectors?
  React's external store API guarantees consistent snapshots during concurrent
  rendering. Using it per selector keeps components subscribed only to the
  slices they read without custom memoization or selector caches.
  */
  function useState() {
    React.useEffect(() => {
      runInit()
    }, [])
    return React.useSyncExternalStore(subscribe, getSnapshot)
  }

  const createSelectorHook = <T>(
    selector: (state: FullState) => T
  ): (() => T) => {
    return function useStoreSelector() {
      React.useEffect(() => {
        runInit()
      }, [])
      return React.useSyncExternalStore(subscribe, () =>
        selector(combinedState)
      )
    }
  }

  const selectors: Selectors<FullState> = {} as Selectors<FullState>
  for (const key in baseState) {
    selectors[key] = createSelectorHook((state) => state[key])
  }
  if (init.derivedState) {
    for (const key in init.derivedState) {
      selectors[key] = createSelectorHook((state) => state[key])
    }
  }

  return {
    init: runInit,
    useState,
    getSnapshot,
    update,
    subscribe,
    dispatch: actionDispatchers,
    trigger: actionTriggerMakers,
    select: selectors,
  }
}

/**
 * Extracts the parameter types of a function, excluding the first parameter
 * @template F - Function type to extract parameters from
 */
type TailArguments<F> = F extends (...args: infer P) => unknown
  ? P extends [unknown, ...infer R]
    ? R
    : never
  : never
