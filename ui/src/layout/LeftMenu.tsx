import {Link, useNavigate} from "@tanstack/react-router";
import {useStore} from "../store/useStore.ts";
import {NewEntry} from "../components/NewEntry.tsx";
import { useActions } from "../store/useActions.ts";
import {useCallback} from "react";

export function LeftMenu() {
  const store = useStore();
  const actions = useActions();
  const fächer = store.fächer;
  const navigate = useNavigate()
  const addFach = useCallback(async (fachName: string) => {
    actions.addFach(fachName);
    await navigate({to: "/fach/$fachName", params: {fachName: fachName}});
  }, [actions, navigate]);
  return (<>
    <aside className="menu is-hidden-mobile"  style={{paddingLeft: 10}}>
      <p className="menu-label">
        Fächer
      </p>
      <ul className="menu-list">
        {fächer.map(fach => <Link key={fach.name} activeProps={{className: "is-active"}} to="/fach/$fachName" params={{fachName: fach.name}}>{fach.name}</Link> )}
        <NewEntry onNewEntry={addFach} />
      </ul>
      <p className="menu-label">
        Verwaltung
      </p>
      <ul className="menu-list">
        <li><a>Klasse</a></li>
      </ul>
    </aside>
    </>);
}