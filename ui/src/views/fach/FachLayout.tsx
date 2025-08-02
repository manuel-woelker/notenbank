import {Outlet} from "@tanstack/react-router";
import {FachMenu} from "./FachMenu.tsx";

export function FachLayout() {
  return (
      <>
      <div className="columns">
    <div className="column is-9">
      <Outlet />
    </div>
    <div className="column is-3 ">
      <FachMenu/>
    </div>
  </div></>);
}