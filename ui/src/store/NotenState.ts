import {bail} from "../util/error.ts";
import {makeId} from "../util/id.ts";

export interface Fach {
  id: string,
  name: string,
}

export interface Schüler {
  id: string,
  vorname: string,
  nachname: string,
}

export function makeSchüler(vorname: string, nachname: string): Schüler {
  return {id: makeId(), vorname, nachname};
}

export interface Schuljahr {
  id: string,
  name: string,
  klassen: Klasse[],
}

export interface Klasse {
  id: string,
  name: string,
  schüler: Schüler[],
  fächer: Fach[],
}
export interface NotenState {
  schuljahre: Schuljahr[],
}

export function getKlasse(state: NotenState, schuljahrId: string, klassenId: string): Klasse {
  return state.schuljahre.find(schuljahr => schuljahr.id === schuljahrId)?.klassen.find(klasse => klasse.id === klassenId) ?? bail(() => `Klasse ${klassenId} in Schuljahr ${schuljahrId} not found`);
}