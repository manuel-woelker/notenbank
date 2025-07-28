import {fachRoute, klasseRoute, schuljahrRoute} from "../routing.tsx";
import {getKlasse} from "./State.ts";
import {useStore} from "./useStore.ts";
import {bail} from "../util/error.ts";


export function useKlasse() {
  const schuljahrId = schuljahrRoute.useParams().schuljahrId;
  const klassenId = klasseRoute.useParams().klassenId;
  return {
    klasse: useStore(state => getKlasse(state, schuljahrId, klassenId)),
    schuljahrId,
    klassenId,
  };
}



export function useFach() {
  const schuljahrId = schuljahrRoute.useParams().schuljahrId;
  const klassenId = klasseRoute.useParams().klassenId;
  const fachId = fachRoute.useParams().fachId;
  return {
    fach: useStore(state => getKlasse(state, schuljahrId, klassenId).fächer.find(fach => fach.id === fachId) ?? bail(() => `Fach ${fachId} in Schuljahr ${schuljahrId} not found`)),
  };
}
