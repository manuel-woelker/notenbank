import {type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState} from "react";
import type {Schüler} from "../store/NotenState.ts";

export interface NewSchülerProps {
  onNewSchüler: (vorname: string, nachname: string) => void;
}


export const NewSchüler = (props: NewSchülerProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<Partial<Schüler>>({vorname: "", nachname: ""});
  const valueRef = useRef<Partial<Schüler>>({});
  useEffect(() => {
    valueRef.current = value;
  })
  const nachnameRef = useRef<HTMLInputElement>(null);
  const vornameRef = useRef<HTMLInputElement>(null);
  const onChangeVorname = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue((prevState) => ({...prevState, vorname: event.target.value}));
  }, []);
  const onChangeNachname = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue((prevState) => ({...prevState, nachname: event.target.value}));
  }, []);
  const onDone = useCallback(() => {
    const schüler = valueRef.current;
    props.onNewSchüler(schüler.vorname!, schüler.nachname!);
    setValue({vorname: "", nachname: ""});
    vornameRef.current?.focus();
  }, [props]);
  const onVornameKeypress = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      nachnameRef.current?.focus();
    }
  }, []);
  const onNachnameKeypress = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      onDone();
    }
  }, [onDone]);
  return <>
    {editing?
        <>
          <div className="field is-grouped">
            <p className="control">
              <input value={value.vorname} onChange={onChangeVorname} onKeyPress={onVornameKeypress} autoFocus
                     className="input is-expanded" type="text" placeholder="Vorname" ref={vornameRef}/>
            </p>
            <p className="control">
              <input value={value.nachname} onChange={onChangeNachname} onKeyPress={onNachnameKeypress}
                     className="input is-expanded" type="text" placeholder="Nachname" ref={nachnameRef}/>
            </p>
            <p className="control">
              <button className="button is-primary" onClick={() => onDone()}>Schüler hinzufügen</button>
            </p>
          </div>
          <p className="control">
          </p>
        </>
        :
        <a onClick={() => setEditing(true)}>+ Schüler hinzufügen</a>
    }
  </>
};