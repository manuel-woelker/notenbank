import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {makeSchüler, type Schüler} from "../../store/NotenState.ts";
import {useKlasse} from "../../store/useParams.ts";
import {NewSchüler} from "../../components/NewSchüler.tsx";
import {useActions} from "../../store/useActions.ts";
import {useRef} from "react";
import {SchülerTableDefaultCell} from "./SchülerTableDefaultCell.tsx";


const columnHelper = createColumnHelper<Schüler>()

const columns = [
  columnHelper.accessor("vorname", {
    header: 'Vorname',
    cell: SchülerTableDefaultCell,
  }),
  columnHelper.accessor("nachname", {
    header: 'Nachname',
    cell: SchülerTableDefaultCell,
  }),
]


export function SchülerTable() {
  const {
    klasse
  } = useKlasse();
  const schüler = klasse.schüler;
  const actions = useActions();
  const table = useReactTable({
    getRowId: schüler => schüler.id,
    data: schüler,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateSchüler: (schülerPartial: Partial<Schüler> & Pick<Schüler, "id">) => {
        actions.updateSchüler(schülerPartial);
      },
    }
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
            <td colSpan={3}>
              <NewSchüler onNewSchüler={(vorname, nachname) => {
                actions.addSchüler(makeSchüler(vorname, nachname))
              }}/>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
  )
}