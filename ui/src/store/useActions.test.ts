import {actions} from "./useActions.ts";
import {useNotenStore} from "./useNotenStore";
import type {Schüler} from "./state/Schüler.ts";
import type {NotenState} from "./state/NotenState.ts";
import dayjs from "dayjs";
import {produce} from "immer";
import * as MockDate from "mockdate";

const schuljahrId = '2023/2024';
const klassenId = '5a';
const fachId = 'Mathematik';
const notenfeststellungId = 'Schulaufgabe 1';
const now = dayjs("2023-01-01T00:00:00.000Z");

// Helper functions for test data setup
const createTestState = () => {
  const testState: NotenState = {
    routeParams: {
      schuljahrId,
      klassenId: klassenId,
      fachId,
      notenfeststellungId,
    },
    schuljahre: [{
      id: schuljahrId,
      name: schuljahrId,
      klassen: [{
        id: klassenId,
        name: klassenId,
        schüler: [
          {
            id: "1",
            vorname: 'Max',
            nachname: 'Mustermann',
          }
        ],
        fächer: [
          {
            id: fachId,
            name: 'Mathematik',
            notenfeststellungen: [{
              date: dayjs("2023-01-01"),
              id: 'Schulaufgabe 1',
              name: 'Schulaufgabe 1',
              einzelnoten: {},
              average: 0,
            }],
          }]
      }]
    }]
  };
  useNotenStore.setState(testState, true);
};

const updateTestState = (fn: (testState: NotenState) => void) => {
  useNotenStore.setState((state) => {
    return produce(state, state => {
      fn(state)
    });
  });
};

const createSchüler = (id: string, vorname: string, nachname: string): Schüler => ({
  id,
  vorname,
  nachname
});

describe('useActions', () => {
  beforeEach(() => {
    MockDate.set(new Date("2023-01-01"));
    // Reset the store before each test
    createTestState();
  });

  describe('addSchuljahr', () => {
    it('should add a new schuljahr to the state', () => {
      updateTestState(state => {
        state.schuljahre = [];
      });
      const schuljahrName = '2023/2024';
      actions.addSchuljahr(schuljahrName);

      const state = useNotenStore.getState();
      expect(state.schuljahre).toStrictEqual([
        {
          "id": "2023/2024",
          "klassen": [],
          "name": "2023/2024",
        },
      ])
    });
  });

  describe('addFach', () => {
    it('should add a new fach to the current klasse', () => {
      updateTestState(state => state.schuljahre[0].klassen[0].fächer = []);
      const fachName = 'Mathematik';
      actions.addFach(fachName);

      const state = useNotenStore.getState();
      const klasse = state.schuljahre[0].klassen[0];

      expect(klasse.fächer).toStrictEqual([
        {
          "id": "Mathematik",
          "name": "Mathematik",
          "notenfeststellungen": [],
        },
      ]);
    });
  });

  describe('addNotenfeststellung', () => {

    it('should add a new notenfeststellung to the current fach', () => {
      updateTestState(state => state.schuljahre[0].klassen[0].fächer[0].notenfeststellungen = []);
      const notenfeststellungName = 'Schulaufgabe 1';
      actions.addNotenfeststellung(notenfeststellungName);

      const state = useNotenStore.getState();
      const fach = state.schuljahre[0].klassen[0].fächer[0];

      expect(fach.notenfeststellungen).toStrictEqual([
        {
          "date": now,
          "einzelnoten": {},
          "id": "Schulaufgabe 1",
          "name": "Schulaufgabe 1",
        },
      ]);
    });
  });

  describe('addSchüler', () => {

    it('should add a new schüler to the current klasse', () => {
      updateTestState(state => state.schuljahre[0].klassen[0].schüler = []);
      const schüler = createSchüler('1', 'Max', 'Mustermann');

      actions.addSchüler(schüler);

      const state = useNotenStore.getState();
      const klasse = state.schuljahre[0].klassen[0];

      expect(klasse.schüler).toStrictEqual([schüler]);
    });

    it('should sort schüler by nachname', () => {
      updateTestState(state => state.schuljahre[0].klassen[0].schüler = []);
      const schüler1 = createSchüler('1', 'Max', 'Mustermann');
      const schüler2 = createSchüler('2', 'Anna', 'Apfel');

      actions.addSchüler(schüler1);
      actions.addSchüler(schüler2);

      const state = useNotenStore.getState();
      const klasse = state.schuljahre[0].klassen[0];

      expect(klasse.schüler).toHaveLength(2);
      expect(klasse.schüler[0].nachname).toBe('Apfel');
      expect(klasse.schüler[1].nachname).toBe('Mustermann');
    });
  });

  describe('updateSchüler', () => {
    const schülerId = '1';

    it('should update an existing schüler', () => {
      const updates = {
        id: schülerId,
        vorname: 'Maximilian',
        nachname: 'Müller'
      };

      actions.updateSchüler(updates);

      const state = useNotenStore.getState();
      const schüler = state.schuljahre[0].klassen[0].schüler[0];

      expect(schüler.vorname).toBe('Maximilian');
      expect(schüler.nachname).toBe('Müller');
    });
  });

  describe('updateNote', () => {
    const schülerId = '1';

    it('should add a new note if it does not exist', () => {
      actions.updateNote({
        schülerId,
        note: 2,
      });

      const state = useNotenStore.getState();
      const notenfeststellung = state.schuljahre[0].klassen[0].fächer[0].notenfeststellungen[0];

      expect(notenfeststellung.einzelnoten[schülerId]).toBeDefined();
      expect(notenfeststellung.einzelnoten[schülerId].note).toEqual(2);
    });

    it('should update an existing note', () => {
      // First add a note
      actions.updateNote({
        schülerId,
        note: 2
      });

      // Then update it
      actions.updateNote({
        schülerId,
        note: 3
      });

      const state = useNotenStore.getState();
      const notenfeststellung = state.schuljahre[0].klassen[0].fächer[0].notenfeststellungen[0];

      expect(notenfeststellung.einzelnoten[schülerId].note).toEqual(3);
    });

    it('should update the average after adding a note', () => {

      actions.updateNote({
        schülerId: "1",
        note: 2
      });
      actions.updateNote({
        schülerId: "2",
        note: 3
      });

      const state = useNotenStore.getState();
      const notenfeststellung = state.schuljahre[0].klassen[0].fächer[0].notenfeststellungen[0];
      expect(notenfeststellung.average).toBe(2.5);

    });
  });
});
