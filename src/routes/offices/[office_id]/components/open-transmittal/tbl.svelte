<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    createSvelteTable,
    FlexRender,
  } from "$lib/components/ui/data-table/index.js";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table/index.js";
  import { setOfficeStoreContext } from "$lib/context/office-store.svelte";
  import type { TransmittalContractItems } from "$lib/types";
  import { apiFetch, formatDate } from "$lib/utils";
  import { getDraftTransmittalContext } from "$routes/offices/components/transmittal-dialog/context.svelte";
  import { ArrowRight, X } from "@lucide/svelte";
  import {
    type ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    type VisibilityState,
  } from "@tanstack/table-core";
  import { ScrollState } from "runed";
  import { onMount, tick } from "svelte";
  import { fly } from "svelte/transition";
  import { getOfficeAllTransmittalContext } from "../../context.svelte";
  import AddEmployeeDialog from "../add-employee-dialog.svelte";
  import { setOfficeTransmittalContext } from "./context.svelte";
  import DeleteAltertDialog from "./delete-altert-dialog.svelte";
  import { columns } from "./table-schema";
  import TblRemarks from "./tbl-remarks.svelte";

  const officeAllTransCtx = getOfficeAllTransmittalContext();
  /** Transmittals for specific office*/
  const officeTransCtx = setOfficeTransmittalContext();
  const drfTransCtx = getDraftTransmittalContext();
  const officeStoreCtx = setOfficeStoreContext<TransmittalContractItems>([]);

  let sorting = $state<SortingState>([{ id: "start_date", desc: false }]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let columnVisibility = $state<VisibilityState>({});
  let el = $state<HTMLElement>();
  const scroll = new ScrollState({ element: () => el });
  let arrivedRight = $derived.by(() => {
    // console.log(scroll.progress.x);

    if (Number.isNaN(scroll.progress.x)) return "";
    return Math.round(scroll.progress.x) >= 95 ? "" : null;
  });

  const table = createSvelteTable({
    get data() {
      return officeTransCtx.items;
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

  onMount(async () => {
    const res = await apiFetch(
      `/api/view/transmittal-items?transmittal_pk=${officeAllTransCtx.openTransmittal?.transmittal_pk}`
    );

    if (!res.ok) {
      console.error("Naay error sa pag fetch");
      return;
    }

    officeTransCtx.items = (await res.json()) as TransmittalContractItems[];
    officeStoreCtx.fetchOffices(officeTransCtx.items);
  });
</script>

<div data-right={arrivedRight} class="flex p-1 pl-4 group relative">
  <div class="pt-2 text-muted-foreground text-sm **:inline ml-auto">
    {#if officeAllTransCtx.openTransmittal}
      <div class="flex gap-2 items-center">
        <span>
          {formatDate(officeAllTransCtx.openTransmittal.start_date)}
        </span>
        <ArrowRight class="size-3.5 -translate-y-0.5" />
        <span>
          {formatDate(officeAllTransCtx.openTransmittal.end_date)}
        </span>
      </div>
      <div class="ml-4">
        Funding Charge: {officeAllTransCtx.openTransmittal.funding_charge}
      </div>

      <div class="ml-4">
        Total Contracts: {officeTransCtx.items.length}
        <!-- {scroll.progress.x} -->
        <!-- {#if arrivedRight}
          yeah
        {/if} -->
      </div>
    {/if}
  </div>
  <Button
    variant="ghost"
    size="icon-sm"
    class="text-muted-foreground ml-auto"
    onclick={() => (officeAllTransCtx.drawerState = false)}
    title="close drawer"><X /></Button
  >

  <Button
    variant="secondary"
    size="sm"
    class="absolute right-2 -bottom-9 group-data-[right]:hidden"
    onclick={async () => {
      drfTransCtx.setEmployeeTransmittal($state.snapshot(officeTransCtx.items));
      await tick();
      drfTransCtx.addEmpDialogState = true;
    }}>Add Row</Button
  >
</div>

<div
  class="p-4 pt-0 overflow-auto grow group"
  data-right={arrivedRight}
  bind:this={el}
>
  <div class="w-full flex flex-col">
    <div class="w-max mx-auto">
      <div class="pb-2 px-2 pt-1 text-right min-h-[44px]">
        <Button
          class="group-data-[right]:inline-flex hidden"
          variant="secondary"
          size="sm"
          onclick={async () => {
            drfTransCtx.setEmployeeTransmittal(
              $state.snapshot(officeTransCtx.items)
            );
            await tick();
            drfTransCtx.addEmpDialogState = true;
          }}>Add Row</Button
        >
      </div>
      <Table noWrapper>
        <TableHeader class="**:border **:text-center **:uppercase">
          <TableRow>
            <TableHead rowspan={2}>#</TableHead>
            <TableHead rowspan={2}>FULL NAME</TableHead>
            <TableHead rowspan={2}>DESIGNATION</TableHead>
            <TableHead rowspan={2}>RATE PER DAY</TableHead>
            <TableHead colspan={2}>Contract Period</TableHead>
            <TableHead rowspan={2}>Funding Charge</TableHead>
            <TableHead rowspan={2}>Office Assignment</TableHead>
            <TableHead rowspan={2}>NO. OF DAYS</TableHead>
            <TableHead rowspan={2}>ACTIONS</TableHead>
          </TableRow>
          <TableRow>
            <TableHead>FROM</TableHead>
            <TableHead>TO</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each table.getRowModel().rows as row (row.id)}
            <tr
              class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-muted/50 data-[state=selected]:bg-muted border-b group/row transition-colors"
              transition:fly={{ x: -10, duration: 200 }}
            >
              {#each row.getVisibleCells() as cell (cell.id)}
                {@const isAction =
                  cell.column.id === "actions" ? "" : undefined}
                <TableCell
                  class="relative data-[action]:sticky data-[action]:-right-4 data-[action]:p-0"
                  data-action={isAction}
                >
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </TableCell>
              {/each}
            </tr>
          {/each}
        </TableBody>
      </Table>

      <div class="mt-8 px-2 sticky left-0">
        <TblRemarks transmittal={officeAllTransCtx.openTransmittal} />
      </div>
    </div>
  </div>
</div>

<DeleteAltertDialog
  afterDelete={(t) => {
    officeAllTransCtx.updateOpenTransmittalInfo(t);
  }}
/>
<AddEmployeeDialog
  singleSave
  afterAdd={(t) => {
    officeAllTransCtx.updateOpenTransmittalInfo(officeTransCtx.add(t));
  }}
  afterUpdate={(t) => {
    officeAllTransCtx.updateOpenTransmittalInfo(
      officeTransCtx.updateTransmittalInfo(t)
    );
  }}
/>
