import {useCallback, useEffect, useRef, useState} from "react";
import {useFocus} from "../hooks/useFocus.ts";

export interface NewEntryProps {
  onNewEntry: (string) => void;
}

export const NewEntry = (props: NewEntryProps) => {
  const [value, setValue] = useState(null);
  const valueRef = useRef();
  useEffect(() => {
    valueRef.current = value;
  })
  const focusRef = useFocus();
  const onChange = useCallback((event) => {
    setValue(event.target.value);
  }, []);
  const onDone = useCallback(() => {
    props.onNewEntry(valueRef.current);
    setValue(null);
  }, [props]);
  const onKeypress = useCallback((event) => {
    if(event.key === "Enter") {
      onDone();
    }
  }, [onDone]);
  return <>
    {value != null?
        <input value={value} onChange={onChange} onBlur={onDone} onKeyPress={onKeypress} ref={focusRef}/>:
    <a onClick={() => setValue("")} autoFocus>+ Fach hinzufügen</a>
    }
  </>
};