<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import {
    CircleCheck,
    CircleAlert,
    CircleX,
    EllipsisVertical,
    Pencil,
    Trash2,
  } from "@lucide/svelte";
  import { getSideSheetContentContext } from "../context.svelte";
  import { updateContractStatus } from "./activate-contract-alert-dialog.svelte";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { dateHelper } from "$lib/components/date/date-helper";

  interface Props {
    contract: Contract;
  }

  let { contract }: Props = $props();
  let isActivating = $state(false);
  let open = $state(false);
  let isContractEndedOrHasNotStartedYet = $derived(
    (dateHelper.isDateEnded(contract.end_date) &&
      dateHelper.dateStatus(contract.end_date) !== "today") ||
      contract.start_date > dateHelper.getISOToday
  );

  const sheetContext = getSideSheetContentContext();

  async function activateContract() {
    sheetContext.selectedContract = contract;

    // Show dialog if there is an active contract or;
    // The contract is end or not yet started
    if (sheetContext.getActiveContract() || isContractEndedOrHasNotStartedYet) {
      sheetContext.activeContractAlertDialogState = true;
      return;
    }

    if (!sheetContext.selectedContract) return;

    try {
      isActivating = true;
      updateContractStatus(sheetContext.selectedContract).then(() => {
        isActivating = false;
        open = false;
        sheetContext.updateActiveContract(contract.contract_pk);
      });
    } finally {
      isActivating = false;
    }
  }
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger
    class={buttonVariants({
      variant: "ghost",
      class:
        "h-6 has-[>svg]:px-1 ml-auto relative rounded-sm text-muted-foreground",
    })}
  >
    <EllipsisVertical />
    <span class="sr-only">open</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Group>
      <DropdownMenu.Label>Manage Contract</DropdownMenu.Label>
      <DropdownMenu.Item
        onclick={async () => {
          sheetContext.selectedContract = contract;
          sheetContext.editDialogState = true;
        }}
      >
        <Pencil />
        Edit
      </DropdownMenu.Item>
      <DropdownMenu.Item
        variant="destructive"
        onclick={() => {
          sheetContext.selectedContract = contract;
          sheetContext.deleteAlertDialogState = true;
        }}
      >
        <Trash2 />
        Delete
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Label>Set Active Status</DropdownMenu.Label>
      <DropdownMenu.Item
        onclick={activateContract}
        disabled={!!contract.is_active || isActivating}
      >
        {#if isActivating}
          <Spinner />
        {:else}
          <CircleCheck />
        {/if}
        <span>Activate</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item
        variant="destructive"
        disabled={!contract.is_active}
        onclick={() => {
          sheetContext.selectedContract = contract;
          sheetContext.deactiveContractAlertDialogState = true;
        }}
      >
        <CircleX />
        <span>Deactivate</span>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
