import TblCellValue from "$lib/components/tbl-cell-value.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import { formatDate, formatReadable, tsh } from "$lib/utils";
import type { ColumnDef } from "@tanstack/table-core";
import TblActions from "./components/table-cells/tbl-actions.svelte";
import TblContractNums from "./components/table-cells/tbl-contract-nums.svelte";
import TblRemarks from "./components/table-cells/tbl-remarks.svelte";

export const columns: ColumnDef<
  Transmittal & { numOfEmp?: number },
  unknown
>[] = [
  {
    id: "row-number",
    header: () => renderComponent(TblCellValue, { value: "#" }),
    cell: (cell) => {
      return renderComponent(TblCellValue, {
        value: tsh(cell).rowNum,
        class: "text-muted-foreground",
      });
    },
  },
  {
    accessorKey: "start_date",
    header: "START DATE",
    cell: ({ row }) => formatDate(row.original.start_date),
  },
  {
    accessorKey: "end_date",
    header: "END DATE",
    cell: ({ row }) => formatDate(row.original.end_date),
  },
  {
    id: "num-of-emp",
    header: "TOTAL J.O.",
    cell: ({ row }) =>
      renderComponent(TblContractNums, {
        counts: row.original.numOfEmp,
        transmittal_pk: row.original.transmittal_pk,
      }),
  },
  {
    id: "fund_charge",
    accessorFn: ({ funding_charge }) =>
      funding_charge
        .replace(/,\s*/g, " ") // remove comma + following spaces
        .replace(/\s+/g, " ") // collapse multiple spaces
        .trim(),
    header: "FUNDING CHARGE",
    cell: ({ row }) =>
      formatReadable(row.original.funding_charge, { lastSeparator: ", " }),
  },

  {
    accessorKey: "remarks",
    header: "REMARKS",
    cell: ({ row }) =>
      renderComponent(TblRemarks, { remarks: row.original.remarks }),
  },
  {
    id: "action",
    cell: ({ row }) =>
      renderComponent(TblActions, { transmittal: row.original }),
  },
];
