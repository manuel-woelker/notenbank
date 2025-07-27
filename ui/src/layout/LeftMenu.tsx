import {Link, useNavigate} from "@tanstack/react-router";
import {NewEntry} from "../components/NewEntry.tsx";
import { useActions } from "../store/useActions.ts";
import {useCallback} from "react";
import type {Fach} from "../store/State.ts";
import {useKlasse} from "../store/useParams.ts";
import {klasseRoute} from "../routing.tsx";

export function LeftMenu() {
  //const store = useStore();
  const actions = useActions();
  const {
    klasse, schuljahrId, klassenId} = useKlasse();
  const fächer: Fach[] = klasse.fächer;
  const navigate = useNavigate()
  const addFach = useCallback(async (fachName: string) => {
    actions.addFach(schuljahrId, klassenId, fachName);
    await navigate({from: klasseRoute.fullPath, to: "fach/$fachName", params: {fachName: fachName}});
  }, [actions, navigate, schuljahrId, klassenId]);
  return (<>
    <aside className="menu is-hidden-mobile"  style={{paddingLeft: 10}}>
      <p className="menu-label">
        Fächer
      </p>
      <ul className="menu-list">
        {fächer.map(fach => <Link key={fach.id} activeProps={{className: "is-active"}} from={klasseRoute.fullPath} to="fach/$fachName" params={{fachName: fach.name}}>{fach.name}</Link> )}
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