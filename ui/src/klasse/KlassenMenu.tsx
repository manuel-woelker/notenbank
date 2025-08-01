import {Link, useNavigate} from "@tanstack/react-router";
import {NewEntry} from "../components/NewEntry.tsx";
import {useActions} from "../store/useActions.ts";
import {useCallback} from "react";
import type {Fach} from "../store/NotenState.ts";
import {useKlasse} from "../store/useParams.ts";
import {fachRoute, klasseRoute, schülerRoute} from "../routing.tsx";

export function KlassenMenu() {
  const actions = useActions();
  const {
    klasse} = useKlasse();
  const fächer: Fach[] = klasse.fächer;
  const navigate = useNavigate()
  const addFach = useCallback(async (fachName: string) => {
    actions.addFach(fachName);
    await navigate({from: klasseRoute.fullPath, to: "fach/$fachName", params: {fachName: fachName}});
  }, [actions, navigate]);
  return (<>
    <aside className="menu is-hidden-mobile"  style={{paddingLeft: 10}}>
      <ul className="menu-list">
        <li><a>Klasse</a></li>
        <li><Link activeProps={{className: "is-active"}} to={schülerRoute.to} activeOptions={{ exact: true }}>Schüler</Link></li>
      </ul>
      <p className="menu-label">
        Fächer
      </p>
      <ul className="menu-list">
        {fächer.map(fach => <Link key={fach.id} activeProps={{className: "is-active"}} to={fachRoute.to} params={{fachId: fach.id}}>{fach.name}</Link> )}
        <NewEntry onNewEntry={addFach} />
      </ul>
    </aside>
    </>);
}