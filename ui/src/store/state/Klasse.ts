import {bail} from "../../util/error.ts";
import type {Schüler} from "./Schüler.ts";
import type {Fach} from "./Fach.ts";
import type {NotenState} from "./NotenState.ts";

export interface Klasse {
  id: string,
  name: string,
  schüler: Schüler[],
  fächer: Fach[],
}

export function getKlasse(state: NotenState): Klasse {
  const {schuljahrId, klassenId} = state.routeParams;
  return state.schuljahre.find(schuljahr => schuljahr.id === schuljahrId)?.klassen.find(klasse => klasse.id === klassenId) ?? bail(() => `Klasse ${klassenId} in Schuljahr ${schuljahrId} not found`);
}