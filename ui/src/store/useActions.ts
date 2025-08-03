import {
  type NotenState
} from "./state/NotenState.ts";
import {makeActions, type RawAction} from "./makeActions.ts";
import {bail} from "../util/error.ts";
import {deriveNotenfeststellungAverage} from "./state/NotenStateDerivations.ts";
import {addFach} from "./state/Fach.ts";
import type {Id, LocalId} from "./state/id.ts";
import type {Note} from "./state/Einzelnote.ts";
import type {Schüler} from "./state/Schüler.ts";
import {getKlasse} from "./state/Klasse.ts";
import {getNotenfeststellung, makeNotenfeststellung} from "./state/Notenfeststellung.ts";

// Define your actions with their implementations
const rawActions = {
  addSchuljahr(state: NotenState, schuljahrName: string) {
    state.schuljahre.push({id: schuljahrName, name: schuljahrName, klassen: []});
  },
  addFach(state: NotenState, fachName: string): LocalId {
    const klasse = getKlasse(state);
    const fach = addFach(klasse.fächer, {name: fachName});
    return fach.id;
  },
  addNotenfeststellung(state: NotenState, notenfeststellungName: string): string {
    const klasse = getKlasse(state);
    const fach = klasse.fächer.find(fach => fach.id === state.routeParams.fachId) || bail(() => `Fach ${state.routeParams.fachId} not found`);
    const notenfeststellung = makeNotenfeststellung(notenfeststellungName);
    fach.notenfeststellungen.push(notenfeststellung);
    return notenfeststellung.id;
  },
  addSchüler(state: NotenState, schüler: Schüler) {
    const klasse = getKlasse(state)
    klasse.schüler.push(schüler);
    klasse.schüler.sort((a, b) => a.nachname.localeCompare(b.nachname));
  },
  updateSchüler(state: NotenState, schülerPartial: Partial<Schüler> & Pick<Schüler, "id">) {
    const klasse = getKlasse(state);
    const schüler: Schüler = klasse.schüler.find(schüler => schüler.id === schülerPartial.id) || bail(() => `Schüler ${schülerPartial.id} not found`);
    Object.assign(schüler, schülerPartial);
  },
  updateNote(state: NotenState, {schülerId, note}: { schülerId: Id, note: Note }) {
    const notenfeststellung = getNotenfeststellung(state);
    let einzelnote = notenfeststellung.einzelnoten[schülerId];
    if (!einzelnote) {
      einzelnote = {note};
      notenfeststellung.einzelnoten[schülerId] = einzelnote;
    }
    einzelnote.note = note;
    deriveNotenfeststellungAverage(notenfeststellung);
  }
} satisfies Record<string, RawAction>;

// Create the typed actions
export const actions = makeActions(rawActions);

export const useActions = (): typeof actions => actions;

