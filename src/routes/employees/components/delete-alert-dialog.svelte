<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import { getSideSheetContentContext } from "../context.svelte";

  interface Props {
    open?: boolean;
    afterDelete?: (id: number) => void;
  }

  let { open = $bindable(false), afterDelete }: Props = $props();
  const sheetContext = getSideSheetContentContext();

  let isDeleting = $state(false);

  async function onclick() {
    if (!sheetContext.selectedContract) return;
    const id = sheetContext.selectedContract.contract_pk;
    try {
      isDeleting = true;
      const res = await apiFetch(`/api/contract?contract_pk=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Can't delete contract", {
          description: "An error while deleting contract",
        });
        isDeleting = false;
        return;
      }

      open = false;
      afterDelete?.(id);
      isDeleting = false;
      toast.success("Contract deleted succesfully");
    } finally {
      isDeleting = false;
    }
  }
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content
    interactOutsideBehavior={isDeleting ? "ignore" : "close"}
    escapeKeydownBehavior={isDeleting ? "ignore" : "close"}
  >
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete this contract
        from the database
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isDeleting}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        disabled={isDeleting}
        {onclick}
        class={buttonVariants({ variant: "destructive" })}
      >
        {#if isDeleting}
          <Spinner />
        {/if}
        <span>Delete</span>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
