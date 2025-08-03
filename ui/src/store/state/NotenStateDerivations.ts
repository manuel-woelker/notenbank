import type {Notenfeststellung} from "./Notenfeststellung.ts";

export function deriveNotenfeststellungAverage(notenfeststellung: Notenfeststellung) {
  let sum = 0;
  let count = 0;
  for (const note of Object.values(notenfeststellung.einzelnoten)) {
    if (note.note && !isNaN(note.note)) {
      sum += note.note;
      count++;
    }
  }
  if (count === 0) {
    notenfeststellung.average = undefined;
  } else {
    notenfeststellung.average = sum / count;
  }
}