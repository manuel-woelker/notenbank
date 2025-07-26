import {NavBar} from "./NavBar.tsx";
import {LeftMenu} from "./LeftMenu.tsx";
import {Outlet} from "@tanstack/react-router";

export function Layout() {

  return (
      <>
        <NavBar />
        <div className="container">
          <div className="columns">
            <div className="column is-3 ">
            <LeftMenu />
            </div>
            <div className="column is-9">
              <Outlet />
            </div>
          </div>
        </div>
      </>
  )
}
