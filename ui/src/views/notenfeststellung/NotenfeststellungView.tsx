import {useFach, useNotenfeststellung} from "../../store/useParams.ts";
import {NotenfeststellungTable} from "./NotenfeststellungTable.tsx";


export function NotenfeststellungView() {
  const {fach} = useFach();
  const {notenfeststellung} = useNotenfeststellung();
  return (<div>
    <h4 className="subtitle is-4">{fach.name} - {notenfeststellung.name}</h4>
    <NotenfeststellungTable/>
  </div>);
}