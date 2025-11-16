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
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Spinner } from "$lib/components/ui/spinner";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import { getSideSheetContentContext } from "../context.svelte";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
  const sheetContext = getSideSheetContentContext();
  let submitBtn = $state<HTMLButtonElement | null>(null);
  let isUpdating = $state(false);

  async function onclick() {
    if (!sheetContext.selectedContract) return;

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
      <AlertDialog.Title>Activate this contract?</AlertDialog.Title>
      <AlertDialog.Description>
        <p class="mb-2">
          Activating this contract will result in the following:
        </p>
        <ul class="ml-5 list-disc">
          <li>The currently active contract will be deactivated.</li>
          <li>This contract will become the new active record.</li>
        </ul>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isUpdating}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action disabled={isUpdating} {onclick} bind:ref={submitBtn}>
        {#if isUpdating}
          <Spinner />
        {/if}
        <span>Activate</span>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
