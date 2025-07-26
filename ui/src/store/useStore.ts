import type {State} from "./State.ts";


const initialState: State = {
  fächer: [
    {name: "Deutsch"},
    {name: "Mathe"},
    {name: "Musik"},
    {name: "Sachkunde"},
  ]

}

export const useStore = function() : State {
  return initialState;
}