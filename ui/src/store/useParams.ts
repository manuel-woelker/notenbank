import {klasseRoute, schuljahrRoute} from "../routing.tsx";
import {getKlasse} from "./State.ts";
import {useStore} from "./useStore.ts";


export function useKlasse() {
  const schuljahrId = schuljahrRoute.useParams().schuljahrId;
  const klassenId = klasseRoute.useParams().klassenId;
  return {
    klasse: useStore(state => getKlasse(state, schuljahrId, klassenId)),
    schuljahrId,
    klassenId,
  };
}
