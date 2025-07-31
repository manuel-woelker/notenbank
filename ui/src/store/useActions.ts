import {type Schüler, type NotenState, makeFach, makeNotenfeststellung, getKlasse2} from "./NotenState.ts";
import {makeActions, type RawAction} from "./makeActions.ts";
import {bail} from "../util/error.ts";

// Define your actions with their implementations
const rawActions = {
  addSchuljahr(state: NotenState, schuljahrName: string) {
    state.schuljahre.push({id: schuljahrName, name: schuljahrName, klassen: []});
  },
  addFach(state: NotenState, fachName: string, params: {schuljahrId: string, klassenId: string}) {
    const klasse = getKlasse2(state, params);
    klasse.fächer.push(makeFach(fachName));
  },
  addNotenfeststellung(state: NotenState, notenfeststellungName: string, params: {schuljahrId: string, klassenId: string, fachId: string}): string {
    const klasse = getKlasse2(state, params);
    const fach = klasse.fächer.find(fach => fach.id === params.fachId) || bail(() => `Fach ${params.fachId} not found`);
    const notenfeststellung = makeNotenfeststellung(notenfeststellungName);
    fach.notenfeststellungen.push(notenfeststellung);
    return notenfeststellung.id;
  },
  addSchüler(state: NotenState, schüler: Schüler, params: {schuljahrId: string, klassenId: string}) {
    const klasse = getKlasse2(state, params)
    klasse.schüler.push(schüler);
    klasse.schüler.sort((a, b) => a.nachname.localeCompare(b.nachname));
  },
  updateSchüler(state: NotenState, schülerPartial: Partial<Schüler> & Pick<Schüler, "id">, params: {schuljahrId: string, klassenId: string}) {
    const klasse = getKlasse2(state, params);
    const schüler: Schüler = klasse.schüler.find(schüler => schüler.id === schülerPartial.id) || bail(() => `Schüler ${schülerPartial.id} not found`);
    Object.assign(schüler, schülerPartial);
  },
} satisfies Record<string, RawAction>;

// Create the typed actions
export const actions = makeActions(rawActions);

export const useActions = (): typeof actions => actions;
