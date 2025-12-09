<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index";
  import { Plus } from "@lucide/svelte";
  import AddEditOfficeDialog from "./components/add-edit-office-dialog.svelte";
  import DeleteOfficeDialog from "./components/delete-office-dialog.svelte";
  import { getOfficeContext } from "./context.svelte";
  import OfficeTable from "./office-table.svelte";

  const context = getOfficeContext();
  // const transContext = setTransmittalDraftContext();
</script>

<svelte:head>
  <title>Offices</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div class="text-sm ml-2">All Office</div>

    <Button
      class="ml-auto mr-2"
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
