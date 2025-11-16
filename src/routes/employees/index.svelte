<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index";
  import { UserRoundPlus } from "@lucide/svelte";
  import SideSheetContent from "./components/side-sheet-content.svelte";
  import { getEmployeeContext } from "./context.svelte";
  import EmployeeTable from "./employee-table.svelte";

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
    <SideSheetContent />
  </div>
</RouteContent>
