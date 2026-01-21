<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import type { EscapeBehaviorType } from "node_modules/bits-ui/dist/bits/utilities/escape-layer/types";
  import { getOfficeAllTransmittalContext } from "../context.svelte";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";

  interface Props {
    open: boolean;
    afterDelete?: (
      trans: NonNullable<typeof officeAllTransCtx.openTransmittal>,
    ) => void;
  }
  const officeAllTransCtx = getOfficeAllTransmittalContext();
  let { open = $bindable(false), afterDelete }: Props = $props();

  let isDeleting = $state(false);
  let shouldClose: EscapeBehaviorType = $derived(
    isDeleting ? "ignore" : "close",
  );

  async function deleteTransmittal() {
    try {
      if (!officeAllTransCtx.openTransmittal) {
        console.error("No transmittalPk");
        return;
      }
      const transmittalPk = officeAllTransCtx.openTransmittal.transmittal_pk;

      const res = await apiFetch(
        `/api/transmittal?transmittal_pk=${transmittalPk}`,
        { method: "DELETE" },
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
      officeAllTransCtx.removeTransmittal(transmittalPk);
      open = false;
      afterDelete?.(officeAllTransCtx.openTransmittal);
    } finally {
      isDeleting = false;
    }
  }
</script>

<AlertDialog.Root
  bind:open
  onOpenChangeComplete={(open) => {
    if (!open) officeAllTransCtx.openTransmittal = null;
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
