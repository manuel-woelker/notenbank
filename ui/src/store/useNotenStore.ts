import {makeSchüler, type NotenState} from "./NotenState.ts";
import {create} from "zustand/react";


const initialState: NotenState = {
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
              makeSchüler("Max", "Musterschüler"),
              makeSchüler("Siggi", "Sitzenbleiber"),
              makeSchüler("Didi", "Drückeberger"),
              makeSchüler("Nina", "Neunmalschlau"),
              makeSchüler("Rosa", "Schweinchen"),
          ].sort((a, b) => a.nachname.localeCompare(b.nachname)),
        },
      ]
    },
  ]
}



export const useNotenStore = create(() => (initialState))

/*
export const useStore = function() : State {
  return initialState;
}*/