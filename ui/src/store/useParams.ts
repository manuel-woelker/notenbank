import {fachRoute, klasseRoute, notenFeststellungRoute, schuljahrRoute} from "../routing.tsx";
import {getKlasse} from "./NotenState.ts";
import {useNotenStore} from "./useNotenStore.ts";
import {bail} from "../util/error.ts";


export function useKlasse() {
  const schuljahrId = schuljahrRoute.useParams().schuljahrId;
  const klassenId = klasseRoute.useParams().klassenId;
  return {
    klasse: useNotenStore(state => getKlasse(state, schuljahrId, klassenId)),
    schuljahrId,
    klassenId,
  };
}



export function useFach() {
  const schuljahrId = schuljahrRoute.useParams().schuljahrId;
  const klassenId = klasseRoute.useParams().klassenId;
  const fachId = fachRoute.useParams().fachId;
  return {
    fach: useNotenStore(state => getKlasse(state, schuljahrId, klassenId).fächer.find(fach => fach.id === fachId) ?? bail(() => `Fach ${fachId} in Schuljahr ${schuljahrId} not found`)),
  };
}

export function useNotenfeststellung() {
  const {fach} = useFach();
  const notenfeststellungId = notenFeststellungRoute.useParams().notenfeststellungId;
  return {
    notenfeststellung: fach.notenfeststellungen.find(notenfeststellung => notenfeststellung.id === notenfeststellungId) ?? bail(() => `Notenfeststellung ${notenfeststellungId} not found`),
  };
}
