import {Link} from "@tanstack/react-router";

export function NotFoundComponent() {
  return (
    <div>
      <p>Die Adresse wurde nicht gefunden</p>
      <Link to="/">Klicke hier um zur Startseite zu gelangen</Link>
    </div>
  );
}