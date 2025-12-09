<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    createSvelteTable,
    FlexRender,
  } from "$lib/components/ui/data-table/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Inbox } from "@lucide/svelte";
  import {
    type ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    type VisibilityState,
  } from "@tanstack/table-core";
  import { getOfficeContext } from "../context.svelte";
  import { getOfficeAllTransmittalContext } from "./context.svelte";
  import { columns } from "./table-schema";

  const offceAllTransCtx = getOfficeAllTransmittalContext();
  const officeCtx = getOfficeContext();

  let sorting = $state<SortingState>([{ id: "start_date", desc: false }]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let columnVisibility = $state<VisibilityState>({});

  const table = createSvelteTable({
    get data() {
      return offceAllTransCtx.transmittals;
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
      <!-- <NewAdded /> -->
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row>
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
        <Table.Row>
          <Table.Cell colspan={columns.length} class="hover:bg-transparent!">
            <Empty.Root>
              <Empty.Header>
                <Empty.Media variant="icon">
                  <Inbox />
                </Empty.Media>
                <Empty.Title>No Records to Display</Empty.Title>
                <Empty.Description>
                  There are currently no transmittal records associated with
                  this office
                </Empty.Description>
              </Empty.Header>
              <Empty.Content>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    onclick={() => window.location.reload()}
                    >Refresh Page</Button
                  >
                  <Button
                    onclick={() => {
                      officeCtx.transmittalPageState = true;
                    }}>Add Transmittal</Button
                  >
                </div>
              </Empty.Content>
            </Empty.Root>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
