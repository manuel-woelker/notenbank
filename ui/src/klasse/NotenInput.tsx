import type {Einzelnote, Id, LocalId, Note} from "../store/NotenState.ts";
import {type ChangeEvent, useCallback} from "react";

export interface NotenInputProps {
  schülerId: LocalId;
  note: Einzelnote;
  onChangeNote: (schülerId: Id, note: Note) => void
}

export function NotenInput(props: NotenInputProps) {
  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    props.onChangeNote(props.schülerId, parseFloat(event.target.value));
  }, [props]);
  console.log(props.note);
  return (
    <div>
      <input type="number" placeholder="Note" inputMode="numeric" step="0.25" min="0.75" max="6" value={props.note.note} onChange={onChange}/>
    </div>
  );
}