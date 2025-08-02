import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {type Einzelnote, type Id, type Note, type Schüler} from "../../store/NotenState.ts";
import {useKlasse, useNotenfeststellung} from "../../store/useParams.ts";
import {useCallback, useMemo} from "react";
import {NotenInput} from "./NotenInput.tsx";
import {actions} from "../../store/useActions.ts";


type SchülerWithNote = Schüler & {note: Einzelnote}
const columnHelper = createColumnHelper<SchülerWithNote>()


export function NotenfeststellungTable() {
  const {klasse} = useKlasse();
  const {notenfeststellung} = useNotenfeststellung();
  const changeNote = useCallback((schülerId: Id, note: Note) => {
    actions.updateNote({
      schülerId,
      note
    });
  }, [])
  const schüler = klasse.schüler;
  const schülerWithNote: SchülerWithNote[] = useMemo(() => schüler.map(schüler => {
      const note = notenfeststellung.einzelnoten[schüler.id];
      return {
        ...schüler,
        note
      }
  }), [schüler, notenfeststellung]);
  const columns = useMemo(() => [
    columnHelper.accessor((notendata: SchülerWithNote) => notendata.vorname + " " + notendata.nachname, {
      header: 'Name',
      cell: ctx => ctx.getValue(),
      size: 200,
    }),
    columnHelper.accessor((notendata: SchülerWithNote) => {
      const note = notendata.note;
      return note;
    },{
      header: notenfeststellung.name,
      cell: ctx => <NotenInput note={ctx.getValue()} schülerId={ctx.row.id} onChangeNote={changeNote}/>,
    })
  ], [notenfeststellung, changeNote]);

  const table = useReactTable({
    getRowId: schüler => schüler.id,
    data: schülerWithNote,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
    }
  });

  return (
      <div>
        <table className="table is-fullwidth is-bordered is-striped is-hoverable is-vcentered">
          <thead>
          {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                    <th key={header.id} style={{width: header.getSize()}}>
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
            <td><i>Ø Durchschnitt:</i></td><td><i>{notenfeststellung.average}</i></td>
          </tr>
          </tfoot>
        </table>
      </div>
  )
}