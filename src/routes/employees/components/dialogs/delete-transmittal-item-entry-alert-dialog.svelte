<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import CircleX from "@lucide/svelte/icons/circle-x";
  import AnimateContent from "$lib/components/animate-content.svelte";
  import { apiFetch } from "$lib/utils";
  import { getSideSheetContentContext } from "$routes/employees/context.svelte";
  import { toast } from "svelte-sonner";
  import Link from "$lib/components/display/link.svelte";

  let isSaving = $state(false);
  let href = $state("");
  const sheetContext = getSideSheetContentContext();

  async function deleteEntry() {
    const contract = sheetContext.selectedContract;
    if (!contract) return;
    try {
      const res = await apiFetch(
        `/api/transmittal-item?transmittal_item_pk=${contract.transmittal_item_fk}&withCountCheck=true`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        if (res.status === 409) {
          const transmittal_pk = (await res.json()).transmittal_pk;
          href = `#/offices/${contract.office_fk}?transmittal=${transmittal_pk}`;
          return;
        }

        if (res.status === 404) {
          // When user delete transmittal from the other tab
          toast.info("This entry no longer exists");
          sheetContext.deleteTransItemDialogState = false;
          sheetContext.remove(contract.contract_pk);
          return;
        }

        toast.error("An error while deleting the entry", {
          description: "Please try again!",
        });
        return;
      }

      toast.success("Delete Successfully");
      sheetContext.deleteTransItemDialogState = false;
      sheetContext.remove(contract.contract_pk);
    } finally {
      isSaving = false;
    }
  }
</script>

<AlertDialog.Root
  bind:open={sheetContext.deleteTransItemDialogState}
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) {
      href = "";
      sheetContext.selectedContract = null;
    }
  }}
>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Entry</AlertDialog.Title>
      <AlertDialog.Description>
        <div>
          This action cannot be undone. This will permanently delete an entry in
          the transmittal.
        </div>

        {#if href}
          <AnimateContent innerDelay={500}>
            <div class="pt-2">
              <Alert.Root variant="danger">
                <CircleX />
                <Alert.Title>Cannot Delete this Entry</Alert.Title>
                <Alert.Description class="block">
                  This is the last remaining entry in its transmittal. At least
                  one transmittal entry is required.
                  <Link {href} target="_blank">See Details</Link>
                </Alert.Description>
              </Alert.Root>
            </div>
          </AnimateContent>
        {/if}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        disabled={isSaving}
        onclick={() => deleteEntry()}
        class={buttonVariants({ variant: "destructive" })}
      >
        {#if isSaving}<Spinner />{/if}
        Delete Entry
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
