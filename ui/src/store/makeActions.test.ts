import {makeActions, type RawAction} from "./makeActions.ts";
import type {NotenState} from "./NotenState.ts";
import {useNotenStore} from "./useNotenStore.ts";



// Define your actions with their implementations
const rawActions = {
  addSchuljahr(state: NotenState, schuljahrName: string) {
    state.schuljahre.push({id: schuljahrName, name: schuljahrName, klassen: []});
  },
  clearSchuljahre(state: NotenState) {
    state.schuljahre.length = 0;
  },
} satisfies Record<string, RawAction>;

// Create the typed actions
const actions = makeActions(rawActions);


test('actions should modify the store state', () => {
  actions.clearSchuljahre();
  let store = useNotenStore.getState();
  expect(store.schuljahre).toStrictEqual([]);
  actions.addSchuljahr('2001/2002');
  store = useNotenStore.getState();
  expect(store.schuljahre).toStrictEqual([{
    name: '2001/2002'}]);

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

