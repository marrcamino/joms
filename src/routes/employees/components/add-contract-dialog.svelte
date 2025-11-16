<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { normalizeFormData } from "$lib/utils";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "../context.svelte";
  import ContractFormFields from "../new/components/contract-form-fields.svelte";

  interface Props {
    open?: boolean;
    afterSave?: (contract: Contract) => void;
  }

  type FormData = {
    startDate: string;
    endDate: string;
    officePk: number;
    positionCategoryFk: number;
    designation: string;
    rate: number;
    isActive: 0 | 1;
  };

  let { open = $bindable(false), afterSave }: Props = $props();
  let isSaving = $state(false);
  let hasOverlaps = $state(false);

  const context = getEmployeeContext();
  const sheetContent = getSideSheetContentContext();

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    try {
      const employeeId = $state.snapshot(context.openEmployee?.employee_pk);

      if (!employeeId) {
        console.error("Walay id sa employee");
        return;
      }

      const form = e.currentTarget as HTMLFormElement;
      const formData = normalizeFormData(form) as FormData;

      if (!formData.startDate) return;
      isSaving = true;
      const res = await apiFetch(
        `/api/employee/contract?employee_id=${employeeId}`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        toast.error("An error occor while saving contract", {
          description: "Please try again",
        });
        return;
      }

      const contactPk = ((await res.json()) as { contract_pk: number })
        .contract_pk;

      const newContract: Contract = {
        contract_pk: contactPk,
        employee_fk: employeeId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        designation: formData.designation,
        rate: formData.rate,
        office_fk: formData.officePk,
        position_category_fk: formData.positionCategoryFk,
        is_active: formData.isActive,
      };

      toast.success("Successfully added");
      afterSave?.(newContract);
    } finally {
      isSaving = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="sm:max-w-[480px]"
    escapeKeydownBehavior={isSaving ? "ignore" : "close"}
    interactOutsideBehavior={isSaving ? "ignore" : "close"}
    disableCloseButton={isSaving}
  >
    <form {onsubmit} class="grid gap-4 w-full" autocomplete="off">
      <Dialog.Header>
        <Dialog.Title>Add New Contract</Dialog.Title>
        <Dialog.Description>
          Fields marked with asterisk &lpar;<span class="text-destructive"
            >*</span
          >&rpar; are required.
        </Dialog.Description>
      </Dialog.Header>
      <ContractFormFields
        required
        asContentOnly
        allRequired
        hasActiveContract={sheetContent.hasActiveContract}
        employeeId={context.openEmployee?.employee_pk}
        bind:hadOverlap={hasOverlaps}
      />
      <Dialog.Footer>
        <Dialog.Close
          disabled={isSaving}
          type="button"
          class={buttonVariants({ variant: "secondary" })}>Cancel</Dialog.Close
        >
        <Button type="submit" disabled={isSaving || hasOverlaps}>
          {#if isSaving}
            <Spinner />
          {/if}
          Save Contract
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
