import {bail} from "../util/error.ts";
import {makeId} from "../util/id.ts";
import dayjs, {type Dayjs} from "dayjs";

export type Note = number;
export type Id = string;

export interface Einzelnote {
  note: Note,
}

export function makeNote(note: Note): Einzelnote {
  return {note};
}

export interface Notenfeststellung {
  id: Id,
  name: string,
  date: Dayjs,
  einzelnoten: Record<Id, Einzelnote>,
}
export interface Fach {
  id: string,
  name: string,
  notenfeststellungen: Notenfeststellung[],
}

export function makeFach(name: string): Fach {
  return {id: name, name, notenfeststellungen: []};
}

export function makeNotenfeststellung(name: string): Notenfeststellung {
  return {id: name, name, date: dayjs(), einzelnoten: {}};
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