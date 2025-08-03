import type {NotenState} from "../store/state/NotenState.ts";


const CURRENT_VERSION = 1;
const STORAGE_KEY = "Notenbank_State";

interface PersistentState {
  version: typeof CURRENT_VERSION;
  state: NotenState;
}

export function saveNotenState(state: NotenState) {

  const persistentState = {
    "version": CURRENT_VERSION,
    state: {
      ...state,
      routeParams: undefined,
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
}

export function loadNotenState(): NotenState | undefined {
  const persistentStateString = localStorage.getItem(STORAGE_KEY);
  if (!persistentStateString) {
    console.debug("No NotenState found in localStorage, creating new one");
    return undefined;
  }
  const persistentState = JSON.parse(persistentStateString) as PersistentState;
  if(persistentState.version !== CURRENT_VERSION) {
    console.warn(`Incompatible NotenState version - expected ${CURRENT_VERSION}, got ${persistentState.version}`);
  }
  // TODO: validate state type

  const state = persistentState.state;
  state.routeParams = {
    uninitialized: true,
  };
  return state;
}