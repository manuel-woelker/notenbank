import {SchülerTable} from "../schüler/SchülerTable.tsx";
import {useFach} from "../store/useParams.ts";


export function FachView() {
  const {fach} = useFach();
  return (<div><h2>Fach {fach.name}</h2>
    <SchülerTable/>
  </div>);
}