import {Link} from "@tanstack/react-router";
import {useStore} from "../store/useStore.ts";

export function LeftMenu() {
  const store = useStore();
  const fächer = store.fächer;
  return (<>
    <aside className="menu is-hidden-mobile"  style={{paddingLeft: 10}}>
      <p className="menu-label">
        Fächer
      </p>
      <ul className="menu-list">
        {fächer.map(fach => <Link key={fach.name} activeProps={{className: "is-active"}} to="/fach/$fachName" params={{fachName: fach.name}}>{fach.name}</Link> )}
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