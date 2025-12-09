<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import { getOfficeTransmittalContext } from "./context.svelte";
  import { tick } from "svelte";

  interface Props {
    afterDelete?: (updates: {
      funding_charge: string;
      numOfEmp: number;
      start_date: string;
      end_date: string;
    }) => void;
  }

  let { afterDelete }: Props = $props();

  const officeTransCtx = getOfficeTransmittalContext();
  let isDeleting = $state(false);
  let onlyOneLeft = $derived(officeTransCtx.items.length === 1);

  async function deleteItem() {
    try {
      if (!officeTransCtx.openItem) {
        console.error("walay naka open na item");
        return;
      }
      isDeleting = true;

      const res = await apiFetch(
        `/api/transmittal-item?transmittal_item_pk=${officeTransCtx.openItem.transmittal_item_pk}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        toast.error("Unable to remove employee", {
          description: "Please try again",
        });
        return;
      }

      toast.success("Removed successfully");
      officeTransCtx.deleteDialogState = false;
      await tick();
      officeTransCtx.removeItem(officeTransCtx.openItem.transmittal_item_pk);
      afterDelete?.(officeTransCtx.getLatestDetails());
    } finally {
      isDeleting = false;
    }
  }
</script>

<AlertDialog.Root bind:open={officeTransCtx.deleteDialogState}>
  <AlertDialog.Content mode={onlyOneLeft ? "danger" : "default"}>
    <AlertDialog.Header>
      <AlertDialog.Title>
        {onlyOneLeft ? "Cannot Remove Employee" : "Remove Employee"}
      </AlertDialog.Title>
      <AlertDialog.Description class="">
        {#if onlyOneLeft}
          A transmittal requires at least one employee. Add another employee
          first, then you can remove this one.
        {:else}
          This action cannot be undone. This will permanently delete employee
          from transmittal.
        {/if}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isDeleting}>
        {onlyOneLeft ? "Close" : "Cancel"}</AlertDialog.Cancel
      >
      {#if !onlyOneLeft}
        <AlertDialog.Action
          disabled={isDeleting}
          onclick={deleteItem}
          class={buttonVariants({ variant: "destructive" })}
          >Continue</AlertDialog.Action
        >
      {/if}
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
