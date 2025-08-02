import {useFach} from "../../store/useParams.ts";
import {NotenfeststellungTable} from "./NotenfeststellungTable.tsx";


export function NotenfeststellungView() {
  const {fach} = useFach();
  return (<div><h2>Notenfeststellung {fach.name} Noten</h2>
    <NotenfeststellungTable/>
  </div>);
}