import type {State} from "./State.ts";
import {makeActions, type RawAction} from "./makeActions.ts";

// Define your actions with their implementations
const rawActions: Record<string, RawAction> = {
  addFach(state: State, fachName: string) {
    state.fächer.push({name: fachName});
  },
  // should fail typecheck
 //foo(what: number) {},
} as const;

// Create the typed actions
const actions = makeActions(rawActions);

export const useActions = (): typeof actions => actions;

actions.addFach(1223);
