import {type ErrorComponentProps, Link} from "@tanstack/react-router";

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div>
      <p>Es ist ein Fehler aufgetreten.       <Link to="/">Zur Startseite</Link>
      </p>
      <br />
      <button className="button" onClick={reset}>Neu laden</button>
      <br />
      <br />

      <p>{error.message ? <code>{error.message}</code> : null}</p>
    </div>
  )
}