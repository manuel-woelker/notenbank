import dayjs, {type Dayjs} from "dayjs";
import type {Id} from "./id.ts";
import type {Einzelnote, Note} from "./Einzelnote.ts";
import {getKlasse} from "./Klasse.ts";
import {bail} from "../../util/error.ts";
import type {NotenState} from "./NotenState.ts";

export interface Notenfeststellung {
  id: Id,
  name: string,
  date: Dayjs,
  einzelnoten: Record<Id, Einzelnote>,
  average?: Note,
}

export function makeNotenfeststellung(name: string): Notenfeststellung {
  return {id: name, name, date: dayjs(), einzelnoten: {}};
}

export function getNotenfeststellung(state: NotenState): Notenfeststellung {
  const klasse = getKlasse(state);
  const {fachId, notenfeststellungId} = state.routeParams;
  const fach = klasse.fächer.find(fach => fach.id === fachId) ?? bail(() => `Fach ${fachId} not found`);
  const notenfeststellung = fach.notenfeststellungen.find(notenfeststellung => notenfeststellung.id === notenfeststellungId) ?? bail(() => `Notenfeststellung ${notenfeststellungId} not found`);
  return notenfeststellung;
}