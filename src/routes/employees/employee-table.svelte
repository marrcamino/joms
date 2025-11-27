<script lang="ts">
  import {
    createSvelteTable,
    FlexRender,
  } from "$lib/components/ui/data-table/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import {
    type ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    type VisibilityState,
  } from "@tanstack/table-core";
  import NewAdded from "./components/new-added.svelte";
  import TableEmptyData from "./components/table-empty-data.svelte";
  import { getEmployeeContext } from "./context.svelte";
  import { columns } from "./table-schema";

  const context = getEmployeeContext();

  let sorting = $state<SortingState>([{ id: "fullname", desc: false }]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let columnVisibility = $state<VisibilityState>({});

  const table = createSvelteTable({
    get data() {
      return context.employees;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnVisibilityChange: (updater) => {
      if (typeof updater === "function") {
        columnVisibility = updater(columnVisibility);
      } else {
        columnVisibility = updater;
      }
    },
    onGlobalFilterChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    state: {
      get sorting() {
        return sorting;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get globalFilter() {
        return columnFilters;
      },
    },
  });
</script>

<div class="rounded-md border min-w-0 w-full h-max">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row class="hover:[&>th,td]:!bg-transparent">
          {#each headerGroup.headers as header (header.id)}
            <Table.Head
              colspan={header.colSpan}
              class="first:rounded-tl-md last:rounded-tr-md text-xs"
            >
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      <NewAdded />
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row
          data-state={context.openEmployee?.employee_pk ===
            row.original.employee_pk && "selected"}
          class="data-[state=selected]:bg-blue-600/20"
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <TableEmptyData columnsLenth={columns.length} />
      {/each}
    </Table.Body>
  </Table.Root>
</div>
