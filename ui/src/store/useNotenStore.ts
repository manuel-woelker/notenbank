import {
  addFach, type Fach,
  makeNote,
  makeSchüler,
  type Notenfeststellung,
  type NotenState,
  type RouteParams
} from "./NotenState.ts";
import {create} from "zustand/react";
import dayjs from 'dayjs'

const initialSchüler = [
  makeSchüler("Max", "Musterschüler"),
  makeSchüler("Siggi", "Sitzenbleiber"),
  makeSchüler("Didi", "Drückeberger"),
  makeSchüler("Nina", "Neunmalschlau"),
  makeSchüler("Rosa", "Schweinchen"),
].sort((a, b) => a.nachname.localeCompare(b.nachname));
const diktat1: Notenfeststellung = {
  id: "diktat1",
  name: "Diktat 1",
  date: dayjs('2018-04-13 19:18'),
  einzelnoten: {
    [initialSchüler[0].id]: makeNote(1),
    [initialSchüler[2].id]: makeNote(1.25),
    [initialSchüler[1].id]: makeNote(1.5),
    [initialSchüler[3].id]: makeNote(1.75),
    [initialSchüler[4].id]: makeNote(2),
  }
}
const mündlichHJ1: Notenfeststellung = {
  id: "mündlichHJ1",
  name: "Mündlich HJ 1",
  date: dayjs('2018-04-13 19:18'),
  einzelnoten: {
    [initialSchüler[0].id]: makeNote(2.5),
    [initialSchüler[2].id]: makeNote(1.75),
    [initialSchüler[1].id]: makeNote(4),
    [initialSchüler[3].id]: makeNote(5),
    [initialSchüler[4].id]: makeNote(3),
  }
}
const fächer: Fach[] = [];
const deutsch = addFach(fächer, {name: "Deutsch"});
addFach(fächer, {name: "Mathe"});
addFach(fächer, {name: "Musik"});
addFach(fächer, {name: "Sachkunde"});
deutsch.notenfeststellungen = [diktat1, mündlichHJ1];

const initialState: NotenState = {
  routeParams: {},
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
          fächer,
          schüler: initialSchüler,
        },
      ]
    },
  ]
}



export const useNotenStore = create(() => (initialState))



export const setNotenStoreRouteParams = (routeParams: RouteParams) => useNotenStore.setState(state => ({...state, routeParams}));
/*
export const useStore = function() : State {
  return initialState;
}*/