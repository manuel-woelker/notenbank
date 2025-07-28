import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import type {Schüler} from "../store/State.ts";
import {useKlasse} from "../store/useParams.ts";


const columnHelper = createColumnHelper<Schüler>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
]

export function SchülerTable() {
  const schüler = useKlasse().klasse.schüler;
  const table = useReactTable({
    data: schüler,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
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