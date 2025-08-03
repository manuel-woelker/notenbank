import {Link, useNavigate} from "@tanstack/react-router";
import {NewEntry} from "../../components/NewEntry.tsx";
import {useActions} from "../../store/useActions.ts";
import {useCallback} from "react";
import {useFach} from "../../store/useParams.ts";
import {fachRoute, notenFeststellungRoute} from "../../routing.tsx";

export function FachMenu() {
  const actions = useActions();
  const {fach} = useFach();
  const navigate = useNavigate()
  const addNotenfeststellung = useCallback(async (notenfeststellungName: string) => {
    const notenfeststellungId = actions.addNotenfeststellung(notenfeststellungName);
    await navigate({to: notenFeststellungRoute.to, params: {notenfeststellungId}});
  }, [actions, navigate]);
  return (<>
    <aside className="menu is-hidden-mobile"  style={{paddingLeft: 10}}>
      <ul className="menu-list">
        <li><Link activeProps={{className: "is-active"}} to={fachRoute.to} activeOptions={{ exact: true }} params={{fachId: fach.id}}>Übersicht</Link></li>
      </ul>
      <p className="menu-label">
        Notenfeststellungen
      </p>
      <ul className="menu-list">
        {fach.notenfeststellungen.map(notenfeststellung => <Link key={notenfeststellung.id} activeProps={{className: "is-active"}} to={notenFeststellungRoute.to} params={{notenfeststellungId: notenfeststellung.id}}>{notenfeststellung.name}</Link> )}
        <NewEntry onNewEntry={addNotenfeststellung} label="+ Notenfeststellung hinzufügen" placeholder="Name der Notenfeststellung" />
      </ul>
    </aside>
    </>);
}