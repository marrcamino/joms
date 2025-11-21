<script module lang="ts">
  export function updateContractStatus(
    contract: Contract,
    is_active: 1 | 0 = 1
  ) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const res = await apiFetch(
          `/api/contract/set-active?contract_pk=${contract.contract_pk}&employee_fk=${contract.employee_fk}`,
          {
            method: "PATCH",
            body: JSON.stringify({ is_active }),
          }
        );

        if (!res.ok) {
          toast.error(
            `Can't ${is_active ? "activate" : "deactivate"} contract`,
            {
              description: "Please try again",
            }
          );
          return reject(new Error("Request failed"));
        }

        toast.success(
          `Contract ${is_active ? "activated" : "deactivated"} successfully`
        );
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
</script>

<script lang="ts">
  import { dateHelper } from "$lib/components/date/date-helper";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Spinner } from "$lib/components/ui/spinner";
  import { apiFetch } from "$lib/utils";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { getSideSheetContentContext } from "../context.svelte";
  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
  const sheetContext = getSideSheetContentContext();
  let submitBtn = $state<HTMLButtonElement | null>(null);
  let isUpdating = $state(false);
  let contractEnded = $state(false);
  let contractHasNotStartedYet = $state(false);
  let submitBtnDisabled = $derived(
    isUpdating || contractEnded || contractHasNotStartedYet
  );

  async function onclick() {
    if (!sheetContext.selectedContract || submitBtnDisabled) return;

    try {
      isUpdating = true;
      const contract = sheetContext.selectedContract;
      updateContractStatus(contract).then(() => {
        open = false;
        isUpdating = false;
        sheetContext.updateActiveContract(contract.contract_pk);
      });
    } finally {
      isUpdating = false;
    }
  }

  $effect(() => {
    if (open) {
      untrack(() => {
        const contract = sheetContext.selectedContract;
        if (!contract) return;

        // Contract is Ended
        const isContractEnded =
          dateHelper.isDateEnded(contract.end_date) &&
          dateHelper.dateStatus(contract.end_date) !== "today";
        if (isContractEnded) {
          contractEnded = isContractEnded;
          return;
        }

        contractHasNotStartedYet = contract.start_date > dateHelper.getISOToday;
      });
    }
  });
</script>

<AlertDialog.Root
  bind:open
  onOpenChangeComplete={(open) => {
    if (!open) {
      sheetContext.selectedContract = null;
      contractEnded = false;
      contractHasNotStartedYet = false;
    }
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
      <AlertDialog.Title>
        {#if contractHasNotStartedYet}
          This contract hasn’t started yet
        {:else if contractEnded}
          Cannot activate this contract
        {:else}
          Activate this contract?
        {/if}
      </AlertDialog.Title>
      <AlertDialog.Description>
        {#if contractHasNotStartedYet}
          <p class="text-yellow-600">
            You can only activate this contract once its start date has begun.
          </p>
        {:else if contractEnded}
          <p class="text-yellow-600">
            This contract can no longer be activated because its end date has
            already passed.
          </p>
        {:else}
          <p class="mb-2">Activating this contract will:</p>
          <ul class="ml-5 list-disc">
            <li>Deactivate the currently active contract.</li>
            <li>Set this contract as the new active one.</li>
          </ul>
        {/if}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isUpdating}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        disabled={submitBtnDisabled}
        {onclick}
        bind:ref={submitBtn}
      >
        {#if isUpdating}
          <Spinner />
        {/if}
        <span>Activate</span>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
