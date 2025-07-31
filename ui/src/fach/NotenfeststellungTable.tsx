import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {type Schüler} from "../store/NotenState.ts";
import {useKlasse, useNotenfeststellung} from "../store/useParams.ts";
import {useMemo} from "react";


const columnHelper = createColumnHelper<Schüler>()



export function NotenfeststellungTable() {
  const {klasse} = useKlasse();
  const {notenfeststellung} = useNotenfeststellung();
  const schüler = klasse.schüler;
  const columns = useMemo(() => [
    columnHelper.accessor((schüler: Schüler) => schüler.vorname + " " + schüler.nachname, {
      header: 'Name',
      cell: ctx => ctx.getValue(),
    }),
    columnHelper.accessor((schüler: Schüler) => {
      const note = notenfeststellung.einzelnoten[schüler.id];
      return note ? note.note : "-";
    },{
      header: notenfeststellung.name,
      cell: ctx => ctx.getValue(),
    })
  ], [notenfeststellung]);

  //const actions = useActions();
  const table = useReactTable({
    getRowId: schüler => schüler.id,
    data: schüler,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
    }
  });

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
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                ))}
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  )
}