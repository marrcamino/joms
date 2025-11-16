<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import {
    CircleCheck,
    CircleX,
    EllipsisVertical,
    Pencil,
    Trash2,
  } from "@lucide/svelte";
  import { getSideSheetContentContext } from "../context.svelte";
  import { updateContractStatus } from "./activate-contract-alert-dialog.svelte";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";

  interface Props {
    contract: Contract;
  }

  let { contract }: Props = $props();
  let isActivating = $state(false);
  let open = $state(false);

  const sheetContext = getSideSheetContentContext();

  async function activateContract() {
    sheetContext.selectedContract = contract;

    if (sheetContext.getActiveContract()) {
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
      <DropdownMenu.Label>Status Actions</DropdownMenu.Label>
      <DropdownMenu.Item
        onclick={activateContract}
        disabled={!!contract.is_active || isActivating}
        closeOnSelect={sheetContext.hasActiveContract}
      >
        {#if isActivating}
          <Spinner />
        {:else}
          <CircleCheck />
        {/if}
        Active
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

        Deactivate
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
