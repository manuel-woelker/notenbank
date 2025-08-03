export type Note = number;

export interface Einzelnote {
  note: Note,
}

export function makeNote(note: Note): Einzelnote {
  return {note};
}