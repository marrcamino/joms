import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import { formatDate, formatReadable } from "$lib/utils";
import TblRemarks from "./components/tbl-remarks.svelte";
import TblContractNums from "./components/tbl-contract-nums.svelte";
TblContractNums;

export const columns: ColumnDef<Transmittal, unknown>[] = [
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
    header: "TOTAL CONTRACTS",
    cell: ({ row }) =>
      renderComponent(TblContractNums, {
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
    cell: ({ row }) => formatReadable(row.original.funding_charge),
  },

  {
    accessorKey: "remarks",
    header: "REMARKS",
    cell: ({ row }) =>
      renderComponent(TblRemarks, { remarks: row.original.remarks }),
  },
  // {
  //   id: "action",
  //   cell: ({ row }) =>
  //     renderComponent(OfficeTableAction, { office: row.original }),
  // },
];
