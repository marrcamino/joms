<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index";
  import { ArrowLeft, Plus, Save } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import AddEditOfficeDialog from "./components/add-edit-office-dialog.svelte";
  import AddEditTransmittalPage from "./components/add-edit-transmittal-page.svelte";
  import DeleteOfficeDialog from "./components/delete-office-dialog.svelte";
  import { setTransmittalContext } from "./components/transmittal-dialog/context.svelte";
  import { getOfficeContext } from "./context.svelte";
  import OfficeTable from "./office-table.svelte";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import { tick } from "svelte";

  const context = getOfficeContext();
  const transContext = setTransmittalContext();

  let alterDialogState = $state(false);
  let isSubmitting = $state(false);

  function closePage() {
    context.transmittalPageState = false;
    transContext.resetData();
    alterDialogState = false;
  }

  async function save() {
    try {
      if (isSubmitting) return;
      isSubmitting = true;
      const office_pk = context.openOffice?.office_pk;
      if (!office_pk) return;

      const data = $state.snapshot(transContext.empTrans);
      if (!data.length) return;

      const remarks =
        (document.getElementById("remarks") as HTMLTextAreaElement)?.value ||
        null;

      const dateRange = transContext.getDateRange();
      if (!dateRange) {
        console.error("Walay date range");
        return;
      }
      const res = await apiFetch(
        `/api/office/transmittal?office_pk=${office_pk}`,
        {
          method: "POST",
          body: JSON.stringify({
            remarks,
            transmittals: data,
            start_date: dateRange.start_date,
            end_date: dateRange.end_date,
            funding_charge: transContext.getSourceFunds(),
          }),
        }
      );

      if (!res.ok) {
        toast.error("Unable to save transmittal");
        return;
      }

      const transmittal_pk = ((await res.json()) as any).transmittal_pk;
      console.log(transmittal_pk);
      toast.success("Transmittal saved successfully");

      context.transmittalPageState = false;
      await tick();
      transContext.empTrans = [];
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Offices</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>
      {#if context.transmittalPageState}
        Add Transmittal <span class="text-muted-foreground">&ndash;</span>
        {context.openOffice?.office_abbr}
      {:else}
        Offices
      {/if}
    </div>

    {#if context.transmittalPageState}
      <div class="ml-auto flex items-center gap-2">
        <Button
          variant="ghost-destructive"
          size="sm"
          onclick={() => {
            if (transContext.empTrans.length) {
              alterDialogState = true;
            } else closePage();
          }}
        >
          <!-- <ArrowLeft /> -->
          <span>Cancel</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onclick={() => (transContext.secondDialogState = true)}
        >
          <Plus />
          <span> Add Row</span>
        </Button>
        <Button size="sm" onclick={save}>
          <Save />
          <span>Save</span>
        </Button>
      </div>
    {:else}
      <Button
        class="ml-auto"
        size="sm"
        onclick={() => (context.officeDialogState = true)}
      >
        <Plus />
        <span>Add Office</span>
      </Button>
    {/if}
  {/snippet}
  <div class="p-4 flex">
    <OfficeTable />
  </div>

  {#if context.transmittalPageState}
    <div
      transition:fade={{ duration: 200 }}
      class="absolute inset-0 bg-background overflow-auto z-10"
    >
      <div transition:fly={{ y: 20, duration: 200 }} class="p-4">
        <AddEditTransmittalPage />
      </div>
    </div>
  {/if}
</RouteContent>

<AddEditOfficeDialog />
<DeleteOfficeDialog />

<AlertDialog.Root bind:open={alterDialogState}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Leave without saving?</AlertDialog.Title>
      <AlertDialog.Description>
        You have unsaved changes. Leaving now will discard them.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Continue Editing</AlertDialog.Cancel>
      <AlertDialog.Action
        class={buttonVariants({ variant: "destructive" })}
        onclick={closePage}>Discard Changes</AlertDialog.Action
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
