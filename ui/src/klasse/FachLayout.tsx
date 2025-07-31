import {useFach} from "../store/useParams.ts";
import {Outlet} from "@tanstack/react-router";
import {FachMenu} from "./FachMenu.tsx";

export function FachLayout() {
  const {fach} = useFach();
  return (
      <>
        <h2>Fach {fach.name}</h2>
      <div className="columns">
    <div className="column is-9">
      <Outlet />
    </div>
    <div className="column is-3 ">
      <FachMenu/>
    </div>
  </div></>);
}