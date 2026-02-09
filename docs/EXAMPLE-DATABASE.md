# Example database

Notenbank ships with a separate IndexedDB instance named `notenbank-example` for
testing and demos. The UI exposes a toggle in the top navigation header labeled
"Beispiel-Datenbank" to switch between the primary database and the example
dataset.

When the example database is selected, the application seeds it once with
German sample data (classes, students, subjects, assessments, and grades). The
seed only runs if the database is still empty, so any manual edits made during
testing are preserved. Use the "Beispieldaten zurücksetzen" button in the
header to clear and reseed the example data when needed.
