import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {makeSchüler, type Schüler} from "../store/State.ts";
import {useKlasse} from "../store/useParams.ts";
import {NewSchüler} from "../components/NewSchüler.tsx";
import {useActions} from "../store/useActions.ts";
import {useRef} from "react";


const columnHelper = createColumnHelper<Schüler>()

const columns = [
  columnHelper.accessor((schüler) => schüler.vorname + " " + schüler.nachname, {
    header: 'Name',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
]

export function SchülerTable() {
  const {
    klasse, schuljahrId, klassenId} = useKlasse();
  const schüler = klasse.schüler;
  const actions = useActions();
  const table = useReactTable({
    getRowId: schüler => schüler.id,
    data: schüler,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const initialSchüler = useRef<Set<string>>(null)

  if (initialSchüler.current === null) {
    initialSchüler.current = new Set(schüler.map(schüler => schüler.id));
  }
  return (
    <div>
      <table className="table is-fullwidth is-bordered is-striped is-hoverable">
        <thead>
        {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                  </th>
              ))}
            </tr>

        ))}
        </thead>
        <tbody>
        {table.getRowModel().rows.map(row => (
            <tr key={row.id} className={initialSchüler.current?.has(row.id) ? "" : "flash"}>
              {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
              ))}
            </tr>
          ))}
        <tr>
          <td>
            <NewSchüler onNewSchüler={(vorname, nachname) => {actions.addSchüler(schuljahrId, klassenId, makeSchüler(vorname, nachname))}} />
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  )
}