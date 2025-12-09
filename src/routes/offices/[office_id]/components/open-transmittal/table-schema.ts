import TblCellValue from "$lib/components/tbl-cell-value.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import type { TransmittalContractItems } from "$lib/types";
import { formatDate, formatFullName, tsh } from "$lib/utils";
import type { ColumnDef } from "@tanstack/table-core";
import OfficeInfo from "./office-info.svelte";
import TblActions from "./tbl-actions.svelte";

export const columns: ColumnDef<TransmittalContractItems, unknown>[] = [
  {
    id: "row-number",
    cell: (cell) => {
      return renderComponent(TblCellValue, {
        value: tsh(cell).rowNum,
        class: "text-muted-foreground",
      });
    },
  },
  {
    id: "fullname",
    cell: ({ row }) =>
      formatFullName(row.original, {
        abbreviateMiddle: true,
      }),
  },
  {
    accessorKey: "designation",
  },
  {
    accessorKey: "rate",
    cell: ({ row }) =>
      renderComponent(TblCellValue, { value: row.original.rate }),
  },
  {
    accessorKey: "start_date",
    cell: ({ row }) => formatDate(row.original.start_date),
  },
  {
    accessorKey: "end_date",
    cell: ({ row }) => formatDate(row.original.end_date),
  },
  {
    accessorKey: "funding_charge",
    cell: ({ row }) =>
      renderComponent(TblCellValue, { value: row.original.funding_charge }),
  },
  {
    id: "office-assignment",
    cell: ({ row }) =>
      renderComponent(OfficeInfo, { office_pk: row.original.office_fk }),
  },
  {
    accessorKey: "num_of_days",
    cell: ({ row }) =>
      renderComponent(TblCellValue, { value: row.original.num_of_days }),
  },

  {
    id: "actions",
    cell: ({ row }) => renderComponent(TblActions, { item: row.original }),
  },
];
