import {type RefCallback, useCallback} from 'react';

export function useFocus<T extends HTMLElement>(): RefCallback<T> {
  const handleRef = useCallback((node: HTMLElement | null) => {
    node?.focus()
  }, []);

  return handleRef;
}
