import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import OfficeTitle from "./components/table-cells/office-title.svelte";
import OfficeActiveEmployee from "./components/table-cells/office-active-employee.svelte";
import OfficeTableAction from "./components/table-cells/office-table-action.svelte";

export const columns: ColumnDef<Office, unknown>[] = [
  {
    id: "office-name",
    accessorFn: (row) => row.office_title,
    header: "OFFICE NAME",
    cell: ({ row }) => renderComponent(OfficeTitle, { office: row.original }),
  },
  {
    id: "office-emp-counts",
    header: "NUM. OF ACTIVE JO",
    cell: ({ row }) =>
      renderComponent(OfficeActiveEmployee, { office: row.original }),
  },
  {
    id: "action",
    cell: ({ row }) =>
      renderComponent(OfficeTableAction, { office: row.original }),
  },
];
