import {makeActions, type RawAction} from "./makeActions.ts";
import type {State} from "./State.ts";
import {useStore} from "./useStore.ts";



// Define your actions with their implementations
const rawActions = {
  addFach(state: State, fachName: string) {
    state.fächer.push({name: fachName});
  },
  clearFächer(state: State) {
    state.fächer.length = 0;
  },
} satisfies Record<string, RawAction>;

// Create the typed actions
const actions = makeActions(rawActions);


test('actions should modify the store state', () => {
  actions.clearFächer();
  let store = useStore.getState();
  expect(store.fächer).toStrictEqual([]);
  actions.addFach('Deutsch');
  store = useStore.getState();
  expect(store.fächer).toStrictEqual([{
    name: 'Deutsch'}]);

});

if(Math.PI < 0.0) {
  // type checks
  const rawActions = {
    // @ts-expect-error should fail typecheck since first argument is not a State
    addFach(_: number) {
    },
  } satisfies Record<string, RawAction>;
  console.log(rawActions);


  // @ts-expect-error should fail typecheck since first argument is not a string
  actions.addFach(1234);
}

