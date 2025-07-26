import {Link} from "@tanstack/react-router";
import {useStore} from "../store/useStore.ts";
import {NewEntry} from "../components/NewEntry.tsx";
import { useActions } from "../store/useActions.ts";

export function LeftMenu() {
  const store = useStore();
  const actions = useActions();
  const fächer = store.fächer;
  return (<>
    <aside className="menu is-hidden-mobile"  style={{paddingLeft: 10}}>
      <p className="menu-label">
        Fächer
      </p>
      <ul className="menu-list">
        {fächer.map(fach => <Link key={fach.name} activeProps={{className: "is-active"}} to="/fach/$fachName" params={{fachName: fach.name}}>{fach.name}</Link> )}
        <NewEntry onNewEntry={actions.addFach} />
{/*
        <NewEntry onNewEntry={(newName) => {
          useStore.setState(state => {
            console.log(state);
            return produce(state, state => {
              state.fächer.push({name: newName})});
          })}} />
*/}
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