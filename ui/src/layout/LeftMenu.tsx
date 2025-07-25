import {Link} from "@tanstack/react-router";
import {fachRoute} from "../routing.tsx";

export function LeftMenu() {
  const { fachName } = fachRoute.useParams();
  const fächer = ["Deutsch", "Mathe", "Musik", "Sachkunde"];
  return (<>
    <aside className="menu is-hidden-mobile"  style={{paddingLeft: 10}}>
      <p className="menu-label">
        Fächer
      </p>
      <ul className="menu-list">
        {fächer.map(fach => <Link className={fach === fachName?"is-active":""} to="/fach/$fachName" params={{fachName: fach}}>{fach}</Link> )}
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