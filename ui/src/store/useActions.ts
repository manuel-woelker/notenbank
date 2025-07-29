import {getKlasse, type Schüler, type State} from "./State.ts";
import {makeActions, type RawAction} from "./makeActions.ts";
import {bail} from "../util/error.ts";

// Define your actions with their implementations
const rawActions = {
  addSchuljahr(state: State, schuljahrName: string) {
    state.schuljahre.push({id: schuljahrName, name: schuljahrName, klassen: []});
  },
  addFach(state: State, schuljahrId: string, klassenId: string, fachName: string) {
    const klasse = getKlasse(state, schuljahrId, klassenId);
    klasse.fächer.push({name: fachName, id: fachName});
  },
  addSchüler(state: State, schuljahrId: string, klassenId: string, schüler: Schüler) {
    const klasse = getKlasse(state, schuljahrId, klassenId);
    klasse.schüler.push(schüler);
    klasse.schüler.sort((a, b) => a.nachname.localeCompare(b.nachname));
  },
  updateSchüler(state: State, schuljahrId: string, klassenId: string, schülerPartial: Partial<Schüler> & Pick<Schüler, "id">) {
    const klasse = getKlasse(state, schuljahrId, klassenId);
    const schüler: Schüler = klasse.schüler.find(schüler => schüler.id === schülerPartial.id) || bail(() => `Schüler ${schülerPartial.id} not found`);
    Object.assign(schüler, schülerPartial);
  },
} satisfies Record<string, RawAction>;

// Create the typed actions
export const actions = makeActions(rawActions);

export const useActions = (): typeof actions => actions;
