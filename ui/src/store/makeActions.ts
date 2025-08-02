import {useNotenStore} from "./useNotenStore.ts";
import {produce} from "immer";
import type {NotenState} from "./NotenState.ts";
import {saveNotenState} from "../persistence/persistence.ts";



const devTools = typeof window !== "undefined" ? window?.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: "Notenbank",
}) : undefined;

devTools?.init(useNotenStore.getInitialState());

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type RawAction = (state: NotenState, ...args: any[]) => any;

// Helper to extract action parameters without the state parameter
type ActionParameters<T> = T extends (state: NotenState, ...args: infer P) => unknown ? P : never;


type ActionOf<RAW_ACTION> = RAW_ACTION extends RawAction ? (...args: ActionParameters<RAW_ACTION>) => ReturnType<RAW_ACTION> : never;
// Create a mapped type that transforms raw actions to action creators
type ActionCreators<T> = {
  [K in keyof T]: ActionOf<T[K]>;
};

function createAction(name: string, action: (state: NotenState, ...args: unknown[]) => unknown) {
  return (...args: unknown[]) => {
    let result;
    useNotenStore.setState(state =>
        produce(state, draft => {
          result = action(draft, ...args);
        })
    );
    const state = useNotenStore.getState();
    saveNotenState(state);
    devTools?.send(
        {type: name, args},
        state
    );
    return result;
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