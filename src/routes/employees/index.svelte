<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index";
  import { Root as SheetRoot } from "$lib/components/ui/sheet/index.js";
  import { UserRoundPlus } from "@lucide/svelte";
  import { untrack } from "svelte";
  import SideSheetContent from "./components/side-sheet-content.svelte";
  import { getEmployeeContext, sheetIsVisible } from "./context.svelte";
  import EmployeeTable from "./employee-table.svelte";
  import * as Item from "$lib/components/ui/item/index.js";

  const context = getEmployeeContext();
</script>

<svelte:head>
  <title>Employees</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Employees</div>

    <Button class="ml-auto" size="sm" href="#/employees/new">
      <UserRoundPlus />
      <span>New Employee</span>
    </Button>
  {/snippet}
  <div class="p-4 flex">
    <EmployeeTable />

    {#if sheetIsVisible.current}
      <SheetRoot bind:open={context.sheetOpenState}>
        <SideSheetContent />
      </SheetRoot>
    {:else}
      <div class="pl-4 w-[400px]">
        <div class="border rounded-lg p-4">
          <SideSheetContent />
        </div>
      </div>
    {/if}
  </div>
</RouteContent>
