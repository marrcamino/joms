<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index";
  import { Plus } from "@lucide/svelte";
  import OfficeTable from "./office-table.svelte";
  import { getOfficeContext } from "./context.svelte";
  import AddEditOfficeDialog from "./components/add-edit-office-dialog.svelte";
  import DeleteOfficeDialog from "./components/delete-office-dialog.svelte";
  import AddEditTransmittalDialog from "./components/transmittal-dialog/add-edit-transmittal-dialog.svelte";

  const context = getOfficeContext();
</script>

<svelte:head>
  <title>Offices</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Offices</div>

    <Button
      class="ml-auto"
      size="sm"
      onclick={() => (context.officeDialogState = true)}
    >
      <Plus />
      <span>Add Office</span>
    </Button>
  {/snippet}
  <div class="p-4 flex">
    <OfficeTable />
  </div>
</RouteContent>

<AddEditOfficeDialog />
<DeleteOfficeDialog />
<AddEditTransmittalDialog />
