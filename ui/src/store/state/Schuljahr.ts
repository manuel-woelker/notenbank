import type {Klasse} from "./Klasse.ts";

export interface Schuljahr {
  id: string,
  name: string,
  klassen: Klasse[],
}