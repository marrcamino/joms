<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "../context.svelte";
  import { updateContractStatus } from "./activate-contract-alert-dialog.svelte";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  const sheetContext = getSideSheetContentContext();
  const context = getEmployeeContext();

  let submitBtn = $state<HTMLButtonElement | null>(null);
  let isUpdating = $state(false);

  async function onclick() {
    if (!sheetContext.selectedContract) return;

    try {
      isUpdating = true;
      const contract = sheetContext.selectedContract;
      updateContractStatus(contract, 0).then(() => {
        open = false;
        isUpdating = false;
        sheetContext.updateActiveContract(contract.contract_pk, false);
        context.resetEmployeeDesignation(contract.employee_fk);
      });
    } finally {
      isUpdating = false;
    }
  }
</script>

<AlertDialog.Root
  bind:open
  onOpenChangeComplete={(open) => {
    if (!open) sheetContext.selectedContract = null;
  }}
>
  <AlertDialog.Content
    interactOutsideBehavior={isUpdating ? "ignore" : "close"}
    escapeKeydownBehavior={isUpdating ? "ignore" : "close"}
    onOpenAutoFocus={(e) => {
      e.preventDefault();
      submitBtn?.focus();
    }}
  >
    <AlertDialog.Header>
      <AlertDialog.Title>Deactivate this contract?</AlertDialog.Title>
      <AlertDialog.Description>
        This contract will be deactivated. The employee will have no active
        contract until another is activated.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isUpdating}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        disabled={isUpdating}
        {onclick}
        bind:ref={submitBtn}
        class={buttonVariants({ variant: "destructive" })}
      >
        {#if isUpdating}
          <Spinner />
        {/if}
        <span>Deactivate</span>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
