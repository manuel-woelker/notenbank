import type {State} from "./State.ts";
import {create} from "zustand/react";


const initialState: State = {
  schuljahre: [
    {
      id: "2022-2023",
      name: "2022-2023",
      klassen: [
        {id: "1a", name: "1a", schüler: [], fächer: []},
      ]
    },
    {
      id: "2023-2024",
      name: "2023-2024",
      klassen: [
        {
          id: "2a",
          name: "2a",
          fächer: [
            {name: "Deutsch", id: "Deutsch"},
            {name: "Mathe", id: "Mathe"},
            {name: "Musik", id: "Musik"},
            {name: "Sachkunde", id: "Sachkunde"},
          ],
          schüler: [
            {name: "Max Musterschüler"},
            {name: "Siggi Sitzenbleiber"},
            {name: "Didi Drückeberger"},
            {name: "Nina Neunmalschlau"},
            {name: "Rosa Schweinchen"},
          ]
        },
      ]
    },
  ]


}


export const useStore = create(() => (initialState))

/*
export const useStore = function() : State {
  return initialState;
}*/