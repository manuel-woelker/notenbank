import type {State} from "./State.ts";
import {create} from "zustand/react";


const initialState: State = {
  fächer: [
    {name: "Deutsch"},
    {name: "Mathe"},
    {name: "Musik"},
    {name: "Sachkunde"},
  ],
  schüler: [
    {name: "Max Musterschüler"},
    {name: "Siggi Sitzenbleiber"},
    {name: "Didi Drückeberger"},
    {name: "Nina Neunmalschlau"},
    {name: "Rosa Schweinchen"},
  ]

}


export const useStore = create(() => (initialState))

/*
export const useStore = function() : State {
  return initialState;
}*/