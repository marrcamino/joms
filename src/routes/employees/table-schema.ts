import type { ColumnDef } from "@tanstack/table-core";
import { formatFullName } from "$lib/utils";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import TblCellPosition from "./components/tbl-cell-position.svelte";
import TblCellName from "./components/tbl-cell-name.svelte";
import TableActions from "./components/table-actions.svelte";

export const columns: ColumnDef<Employee, unknown>[] = [
  {
    id: "fullname",
    accessorFn: (row) =>
      formatFullName(
        {
          lastName: row.lastname,
          firstName: row.firstname,
          middleName: row.middlename,
          nameExtension: row.extension,
        },
        {
          order: "lastname",
        }
      ),

    header: "FULLNAME",

    cell: ({ row }) => {
      return renderComponent(TblCellName, { ...row.original });
    },
  },
  {
    accessorKey: "designation",
    header: "POSITION",
    cell: ({ row }) => {
      return renderComponent(TblCellPosition, {
        designation: row.original.designation,
        office_fk: row.original.office_fk,
      });
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(TableActions, { employee: row.original });
    },
  },
];
