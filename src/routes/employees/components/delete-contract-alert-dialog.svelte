<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "../context.svelte";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
  const sheetContext = getSideSheetContentContext();
  const context = getEmployeeContext();

  let isDeleting = $state(false);

  async function onclick() {
    if (!sheetContext.selectedContract) return;
    const { contract_pk, employee_fk, is_active } =
      sheetContext.selectedContract;
    try {
      isDeleting = true;
      const res = await apiFetch(
        `/api/employee/contract?contract_pk=${contract_pk}`,
        {
          method: "DELETE",
          body: JSON.stringify({
            employee_pk: sheetContext.selectedContract.employee_fk,
            is_active: sheetContext.selectedContract.is_active,
          }),
        }
      );

      if (!res.ok) {
        toast.error("Can't delete contract", {
          description: "An error while deleting contract",
        });
        isDeleting = false;
        return;
      }

      open = false;
      sheetContext.remove(contract_pk);
      if (is_active) {
        context.updateActiveStatus({
          employee_pk: employee_fk,
          designation: null,
          is_active: 0,
          office_fk: null,
        });
      }
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
      <AlertDialog.Title>Delete Contract?</AlertDialog.Title>
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
