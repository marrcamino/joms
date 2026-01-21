<script lang="ts">
  import LazyDialogContent, {
    type LazyContentType,
  } from "$lib/components/display/lazy-dialog-content.svelte";
  import { Root } from "$lib/components/ui/dialog/index.js";
  import {
    apiFetch,
    delayComponentImport,
    nDate,
    normalizeFormData,
  } from "$lib/utils";
  import type { ComponentProps } from "svelte";
  import { toast } from "svelte-sonner";
  import type ContentType from "./content.svelte";

  import type { APPOINTMENT_STATUS_KEY } from "$lib/constants";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "$routes/employees/context.svelte";
  import type { ContractFormData } from "../types";

  let TheContent: LazyContentType<typeof import("./content.svelte")> =
    $state(null);
  const sheetContext = getSideSheetContentContext();
  const context = getEmployeeContext();
  let isSaving = $state(false);

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    try {
      if (!sheetContext.selectedContract) return;

      const contract_pk = sheetContext.selectedContract.contract_pk;

      if (!contract_pk) {
        console.error("Walay id sa contract");
        return;
      }

      isSaving = true;

      const form = e.currentTarget as HTMLFormElement;
      const formData = normalizeFormData(form) as ContractFormData;

      const res = await apiFetch(`/api/contract?contract_pk=${contract_pk}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        toast.error("An error occor while updading contract", {
          description: "Please try again",
        });
        return;
      }

      const updatedContract: ContractDirect = {
        contract_pk,
        employee_fk: sheetContext.selectedContract.employee_fk,
        start_date: formData.startDate,
        end_date: formData.endDate,
        designation: formData.designation,
        rate: formData.rate,
        office_fk: formData.officePk,
        position_category_fk: formData.positionCategoryFk,
        remarks: formData.remarks,
        is_active: sheetContext.selectedContract.is_active,
        created_at: nDate.getCurrentTimestamp,
        source_type: "contract",
        transmittal_item_fk: null,
        appointment_status: Number(
          formData.appointment_status
        ) as APPOINTMENT_STATUS_KEY,
      };

      toast.success("Updated successfully");

      if (sheetContext.selectedContract.is_active) {
        context.setEmployeeDesignation({
          employee_pk: sheetContext.selectedContract.employee_fk,
          designation: formData.designation,
          office_fk: formData.officePk,
          is_active: 1,
        });
      }

      sheetContext.update(updatedContract);
      sheetContext.editDialogState = false;
    } finally {
      isSaving = false;
    }
  }

  // Only used for getting the function from child, don't set any here
  let resetFormAndValues:
    | ComponentProps<typeof ContentType>["resetFormAndValues"]
    | undefined = $state();
</script>

<Root
  bind:open={sheetContext.editDialogState}
  onOpenChangeComplete={async (isOpen) => {
    if (!isOpen) resetFormAndValues?.();

    if (!TheContent) {
      TheContent = await delayComponentImport(() => import("./content.svelte"));
    }
  }}
>
  <LazyDialogContent class="w-[480px]" ready={TheContent}>
    {#snippet child({ class: className, flyIn })}
      <form {onsubmit} autocomplete="off" class={className} in:flyIn>
        <TheContent {isSaving} bind:resetFormAndValues />
      </form>
    {/snippet}
  </LazyDialogContent>
</Root>
