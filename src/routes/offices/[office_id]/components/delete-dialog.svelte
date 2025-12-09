<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import type { EscapeBehaviorType } from "node_modules/bits-ui/dist/bits/utilities/escape-layer/types";
  import { getOfficeAllTransmittalContext } from "../context.svelte";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";

  const officeTxCtx = getOfficeAllTransmittalContext();
  let isDeleting = $state(false);
  let shouldClose: EscapeBehaviorType = $derived(
    isDeleting ? "ignore" : "close"
  );

  async function deleteTransmittal() {
    try {
      const transmittalPk = officeTxCtx.openTransmittal?.transmittal_pk;

      if (!transmittalPk) {
        console.error("No transmittalPk: ", transmittalPk);
        return;
      }

      const res = await apiFetch(
        `/api/transmittal?transmittal_pk=${transmittalPk}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        toast.error("Server Error Occured", {
          description: "Please try again",
        });

        return;
      }

      const resData = (await res.json()) as { success: boolean };

      if (!resData.success) {
        toast.error("Unable to delete transmittal", {
          description: "Please try again",
        });
        return;
      }

      toast.success("Deleted Successfully");
      officeTxCtx.removeTransmittal(transmittalPk);
      officeTxCtx.deleteDialogState = false;
    } finally {
      isDeleting = false;
    }
  }
</script>

<AlertDialog.Root
  bind:open={officeTxCtx.deleteDialogState}
  onOpenChangeComplete={(open) => {
    if (!open) officeTxCtx.openTransmittal = null;
  }}
>
  <AlertDialog.Content
    interactOutsideBehavior={shouldClose}
    escapeKeydownBehavior={shouldClose}
  >
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Transmittal?</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete this transmittal? All related
        information will be permanently removed.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        disabled={isDeleting}
        class={buttonVariants({ variant: "destructive" })}
        onclick={deleteTransmittal}
      >
        {#if isDeleting}
          <Spinner />
        {/if}
        Delete
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
