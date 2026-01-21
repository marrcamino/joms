<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index";
  import { UserRoundPlus } from "@lucide/svelte";
  import SideSheetContent from "./components/side-sheet-content.svelte";
  import {
    getEmployeeContext,
    setSideSheetContentContext,
  } from "./context.svelte";
  import EmployeeTable from "./employee-table.svelte";

  getEmployeeContext();
  const sheetContext = setSideSheetContentContext();
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

{#await import("./components/dialogs/edit-employee-dialog.svelte") then { default: EditEmployeeDialog }}
  <EditEmployeeDialog bind:open={sheetContext.editEmployeeState} />
{/await}

{#await import("./components/dialogs/delete-employee-alert-dialog.svelte") then { default: DeleteEmployeeAlertDialog }}
  <DeleteEmployeeAlertDialog
    bind:open={sheetContext.deleteEmployeeAlertDialogState}
  />
{/await}
