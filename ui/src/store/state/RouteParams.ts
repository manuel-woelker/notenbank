import type {Id} from "./id.ts";

export interface RouteParams {
  uninitialized?: boolean,
  schuljahrId?: Id,
  klassenId?: Id,
  fachId?: Id,
  notenfeststellungId?: Id,
}