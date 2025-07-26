import {type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState} from "react";
import {useFocus} from "../hooks/useFocus.ts";

export interface NewEntryProps {
  onNewEntry: (name: string) => void;
}

export const NewEntry = (props: NewEntryProps) => {
  const [value, setValue] = useState<string | null>(null);
  const valueRef = useRef<string | null>(null);
  useEffect(() => {
    valueRef.current = value;
  })
  const focusRef = useFocus<HTMLInputElement>();
  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);
  const onDone = useCallback(() => {
    props.onNewEntry(valueRef.current!);
    setValue(null);
  }, [props]);
  const onKeypress = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      onDone();
    }
  }, [onDone]);
  return <>
    {value != null?
        <input value={value} onChange={onChange} onBlur={onDone} onKeyPress={onKeypress} ref={focusRef}
               className="input" type="text" placeholder="Name des Faches"/>:
    <a onClick={() => setValue("")} autoFocus>+ Fach hinzufügen</a>
    }
  </>
};