import {NavBar} from "./NavBar.tsx";
import {Outlet} from "@tanstack/react-router";
import {useNotenStore} from "../store/useNotenStore.ts";

export function Layout() {
  const uninitialized = useNotenStore(state => state.routeParams.uninitialized);

  if(uninitialized) {
    return (
        <>
          Loading...
        </>
    );
  }
  return (
      <>
        <NavBar />
        <div className="container">
          <Outlet />
        </div>
      </>
  );
}
