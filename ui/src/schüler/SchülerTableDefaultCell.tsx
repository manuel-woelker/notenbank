import type {CellContext, ColumnDefTemplate} from "@tanstack/react-table";
import type {Schüler} from "../store/NotenState.ts";
import {useEffect, useState} from "react";


interface SchülerTableMetaType {
  updateSchüler: (schülerPartial: Partial<Schüler> & Pick<Schüler, "id">) => void;
}

export const SchülerTableDefaultCell: ColumnDefTemplate<CellContext<Schüler, string>> = ({getValue, row, column, table}) => {
  const initialValue = getValue()
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue)

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    if (value !== initialValue) {
      (table.options.meta as SchülerTableMetaType).updateSchüler({
        id: row.original.id,
        [column.id]: value,
      });
    }
  }

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
      <input
          className="input is-borderless"
          value={value as string}
          onChange={e => setValue(e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur()
            }
          }}
      />
  )
};