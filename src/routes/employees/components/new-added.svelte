<script lang="ts">
  import {
    FlexRender,
    createSvelteTable,
  } from "$lib/components/ui/data-table/index.js";
  import {
    Cell as TableCell,
    Row as TableRow,
  } from "$lib/components/ui/table/index.js";
  import { getCoreRowModel } from "@tanstack/table-core";
  import { getEmployeeContext } from "../context.svelte";
  import { columns } from "../table-schema";

  const context = getEmployeeContext();

  const table = createSvelteTable({
    get data() {
      return context.newAdded;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
</script>

{@render rowHeader("NEWLY ADDED (NO CONTRACTS)")}

{#each table.getRowModel().rows as row, i (row.id)}
  <TableRow
    class="data-[last]:border-b-4"
    data-last={i === table.getRowModel().rows.length - 1 ? "" : null}
  >
    {#each row.getVisibleCells() as cell (cell.id)}
      <TableCell>
        <FlexRender
          content={cell.column.columnDef.cell}
          context={cell.getContext()}
        />
      </TableCell>
    {/each}
  </TableRow>
{/each}

{@render rowHeader("ACTIVE EMPLOYEES")}

{#snippet rowHeader(title: string)}
  {#if context.newAdded.length}
    <TableRow class="hover:[&>th,td]:!bg-transparent">
      <TableCell
        colspan={table.getRowCount()}
        class="text-muted-foreground py-3"
      >
        {title}
      </TableCell>
    </TableRow>
  {/if}
{/snippet}
