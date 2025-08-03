import {type NotenState} from "./NotenState.ts";
import dayjs from "dayjs";
import {deriveNotenfeststellungAverage} from "./NotenStateDerivations.ts";
import {addFach, type Fach} from "./Fach.ts";
import {makeNote} from "./Einzelnote.ts";
import {makeSchüler} from "./Schüler.ts";
import type {Notenfeststellung} from "./Notenfeststellung.ts";

export const makeInitialNotenState = (): NotenState => {
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
    id: "muendlichHJ1",
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
    routeParams: {
      uninitialized: true,
    },
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
            id: "2b",
            name: "2b",
            fächer,
            schüler: initialSchüler,
          },
        ]
      },
    ]
  }

  // compute derived state
  for (const schuljahr of initialState.schuljahre) {
    for (const klasse of schuljahr.klassen) {
      for (const fach of klasse.fächer) {
        for (const notenfeststellung of fach.notenfeststellungen) {
          deriveNotenfeststellungAverage(notenfeststellung);
        }
      }
    }
  }
  return initialState;
}