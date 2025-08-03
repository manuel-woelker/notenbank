import {makeUniqueId} from "../../util/id.ts";

export interface Schüler {
  id: string,
  vorname: string,
  nachname: string,
}

export function makeSchüler(vorname: string, nachname: string): Schüler {
  return {id: makeUniqueId(), vorname, nachname};
}