import {findUniqueId} from "./id.ts";
import type {Notenfeststellung} from "./Notenfeststellung.ts";

export interface Fach {
  id: string,
  name: string,
  notenfeststellungen: Notenfeststellung[],
}

export function addFach(fächer: Fach[], rawFach: Pick<Fach, "name">): Fach {
  const id = findUniqueId(fächer, rawFach.name);
  const fach = {notenfeststellungen: [], ...rawFach, id};
  fächer.push(fach);
  return fach;
}