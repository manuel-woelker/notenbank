import {NavBar} from "./NavBar.tsx";
import {Outlet} from "@tanstack/react-router";

export function Layout() {

  return (
      <>
        <NavBar />
        <div className="container">
          <Outlet />
        </div>
      </>
  )
}
