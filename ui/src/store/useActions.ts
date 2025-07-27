import {getKlasse, type State} from "./State.ts";
import {makeActions, type RawAction} from "./makeActions.ts";

// Define your actions with their implementations
const rawActions = {
  addSchuljahr(state: State, schuljahrName: string) {
    state.schuljahre.push({id: schuljahrName, name: schuljahrName, klassen: []});
  },
  addFach(state: State, schuljahrId: string, klassenId: string, fachName: string) {
    const klasse = getKlasse(state, schuljahrId, klassenId);
    klasse.fächer.push({name: fachName, id: fachName});
  },
} satisfies Record<string, RawAction>;

// Create the typed actions
const actions = makeActions(rawActions);

export const useActions = (): typeof actions => actions;
