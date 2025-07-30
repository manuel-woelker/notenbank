import {useFach} from "../store/useParams.ts";
import {NotenTable} from "../fach/NotenTable.tsx";


export function FachView() {
  const {fach} = useFach();
  return (<div><h2>Fach {fach.name}</h2>
    <NotenTable/>
  </div>);
}