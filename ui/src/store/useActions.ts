import {useStore} from "./useStore.ts";
import {produce} from "immer";
import type {State} from "./State.ts";


const actions = {
  /*  addFach: (fachName: string) => {
      useStore.setState(state => {
        console.log(state);
        return produce(state, state => {
          state.fächer.push({name: fachName})});
      })}*/

  addFach: createAction((fachName: string) => (state: State) => {
    state.fächer.push({name: fachName});
  })
}

type Actions = typeof actions;

export const useActions: () => Actions = () => {
  return actions;
}


function createAction<TArgs extends unknown[]>(f: (...args: TArgs) => (state: State) => void): (...args: TArgs) => void {
  return (...args: TArgs) => {
    useStore.setState(state => {
      console.log(state);
      const innerF = f(...args);
      return produce(state, innerF);
    });
  }
}