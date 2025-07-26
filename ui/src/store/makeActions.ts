import {useStore} from "./useStore.ts";
import {produce} from "immer";
import type {State} from "./State.ts";



// @ts-expect-error __REDUX_DEVTOOLS_EXTENSION__ is not typed
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: "Notenbank",
});

devTools.init(useStore.getInitialState());

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type RawAction = (state: State, ...args: any[]) => void;

// Helper to extract action parameters without the state parameter
type ActionParameters<T> = T extends (state: State, ...args: infer P) => void ? P : never;


type ActionOf<RAW_ACTION> = RAW_ACTION extends RawAction ? (...args: ActionParameters<RAW_ACTION>) => void : never;
// Create a mapped type that transforms raw actions to action creators
type ActionCreators<T> = {
  [K in keyof T]: ActionOf<T[K]>;
};

function createAction(name: string, action: (state: State, ...args: unknown[]) => void) {
  return (...args: unknown[]) => {
    useStore.setState(state =>
        produce(state, draft => {
          action(draft, ...args);
        })
    );
    devTools?.send(
        {type: name, args},
        useStore.getState()
    );
  };
}

// Create the action creators from raw actions
export function makeActions<T extends Record<string, RawAction>>(actions: T): ActionCreators<T> {
  return Object.fromEntries(
      Object.entries(actions).map(([key, action]) => [
        key,
        createAction(key, action)
      ])
  ) as ActionCreators<T>;
}