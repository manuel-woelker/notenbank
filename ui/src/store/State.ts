import {bail} from "../util/error.ts";

export interface Fach {
  id: string,
  name: string,
}

export interface Schüler {
  name: string,
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
export interface State {
  schuljahre: Schuljahr[],
}

export function getKlasse(state: State, schuljahrId: string, klassenId: string): Klasse {
  return state.schuljahre.find(schuljahr => schuljahr.id === schuljahrId)?.klassen.find(klasse => klasse.id === klassenId) ?? bail(() => `Klasse ${klassenId} in Schuljahr ${schuljahrId} not found`);
}