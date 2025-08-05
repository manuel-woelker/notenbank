import {type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState} from "react";
import {useFocus} from "../hooks/useFocus.ts";

export interface NewEntryProps {
  placeholder: string;
  label: string;
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
    const value = valueRef.current?.trim();
    if (value == null || value === "") {
      setValue(null);
      return;
    }
    props.onNewEntry(valueRef.current!);
    setValue(null);
  }, [props]);
  const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onDone();
    }
    if (event.key === 'Escape') {
      setValue(null);
    }
  }, [onDone]);
  return <>
    {value != null?
        <input value={value} onChange={onChange} onBlur={onDone} onKeyDown={onKeyDown} ref={focusRef}
               className="input" type="text" placeholder={props.placeholder} />:
    <a onClick={() => setValue("")} autoFocus>{props.label}</a>
    }
  </>
};