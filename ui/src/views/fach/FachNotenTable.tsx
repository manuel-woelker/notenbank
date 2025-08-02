import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {type Schüler} from "../../store/NotenState.ts";
import {useFach, useKlasse} from "../../store/useParams.ts";
import {useMemo} from "react";


const columnHelper = createColumnHelper<Schüler>()



export function FachNotenTable() {
  const {klasse} = useKlasse();
  const {fach} = useFach();
  const schüler = klasse.schüler;
  const columns = useMemo(() => [
    columnHelper.accessor((schüler: Schüler) => schüler.vorname + " " + schüler.nachname, {
      header: 'Name',
      cell: ctx => ctx.getValue(),
    }),
      ...fach.notenfeststellungen.map(notenfeststellung => {
        return columnHelper.accessor((schüler: Schüler) => {
          const note = notenfeststellung.einzelnoten[schüler.id];
          return note ? note.note : "-";
        },{
          header: notenfeststellung.name,
          cell: ctx => ctx.getValue(),
        })})
  ], [fach]);

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
        <h4 className="subtitle is-4">{fach.name} - Notenübersicht</h4>
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
          <tfoot>
          <tr>
            <td><i>Ø Durchschnitt:</i></td>
            {fach.notenfeststellungen.map(notenfeststellung => {
              return <td key={notenfeststellung.id}><i>{notenfeststellung.average}</i></td>
            })}

          </tr>
          </tfoot>
        </table>
      </div>
  )
}