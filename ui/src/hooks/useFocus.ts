import {RefObject, useCallback} from 'react';

export function useFocus<T extends HTMLElement>(): RefObject<T> {
  const handleRef = useCallback((node) => {
    node?.focus()
  }, []);

  return handleRef;
}
