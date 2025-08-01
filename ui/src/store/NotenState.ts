import {bail} from "../util/error.ts";
import {makeUniqueId} from "../util/id.ts";
import dayjs, {type Dayjs} from "dayjs";

export type Note = number;
export type Id = string;
export type LocalId = string;

export interface Einzelnote {
  note: Note,
}

export interface RouteParams {
  uninitialized?: boolean,
  schuljahrId?: Id,
  klassenId?: Id,
  fachId?: Id,
  notenfeststellungId?: Id,
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

export function addFach(fächer: Fach[], rawFach: Pick<Fach, "name">): Fach {
  const id = findUniqueId(fächer, rawFach.name);
  const fach = {notenfeststellungen: [],...rawFach, id};
  fächer.push(fach);
  return fach;
}

export function findUniqueId<T extends {id: string}>(items: T[], name: string): string {
  function isUnique(id: string): boolean {
    return !items.find(item => item.id === id);
  }
  const base_id = makeId(name);
  if (isUnique(base_id)) {
    return base_id;
  }
  let i = 2;
  while (!isUnique(`${base_id}_${i}`)) {
    i++;
  }
  return `${base_id}_${i}`;
}

export function makeId(name: string): string {
  return name.replace(/\W+/g, '-')
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
  return {id: makeUniqueId(), vorname, nachname};
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
  routeParams: RouteParams,
}

export function getKlasse(state: NotenState): Klasse {
  const {schuljahrId, klassenId} = state.routeParams;
  return state.schuljahre.find(schuljahr => schuljahr.id === schuljahrId)?.klassen.find(klasse => klasse.id === klassenId) ?? bail(() => `Klasse ${klassenId} in Schuljahr ${schuljahrId} not found`);
}