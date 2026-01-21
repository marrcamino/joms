<script lang="ts">
  import LazyDialogContent, {
    type LazyContentType,
  } from "$lib/components/display/lazy-dialog-content.svelte";
  import { Root } from "$lib/components/ui/dialog/index.js";
  import type { APPOINTMENT_STATUS_KEY } from "$lib/constants";
  import {
    apiFetch,
    delayComponentImport,
    nDate,
    normalizeFormData,
  } from "$lib/utils";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "$routes/employees/context.svelte";
  import { toast } from "svelte-sonner";
  import type { ContractFormData } from "../types";

  const sheetContext = getSideSheetContentContext();
  const context = getEmployeeContext();

  let TheContent: LazyContentType<typeof import("./content.svelte")> =
    $state(null);

  let isSaving = $state(false);
  let hasOverlaps = $state(false);

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    if (hasOverlaps) return;

    try {
      const employeeId = $state.snapshot(context.openEmployee?.employee_pk);

      if (!employeeId) {
        console.error("Walay id sa employee");
        return;
      }

      const form = e.currentTarget as HTMLFormElement;
      const formData = normalizeFormData(form) as ContractFormData & {
        isActive: 0 | 1;
      };

      if (!formData.startDate) return;
      isSaving = true;
      const res = await apiFetch(
        `/api/employee/contract?employee_pk=${employeeId}`,
        {
          method: "POST",
          body: JSON.stringify({ ...formData, source_type: "contract" }),
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
        remarks: formData.remarks,
        is_active: formData.isActive,
        created_at: nDate.getCurrentTimestamp,
        source_type: "contract",
        transmittal_item_fk: null,
        appointment_status: Number(
          formData.appointment_status
        ) as APPOINTMENT_STATUS_KEY,
      };

      sheetContext.add(newContract);
      sheetContext.addDialogState = false;
      toast.success("Successfully added");
      if (formData.isActive) {
        context.updateActiveStatus({
          employee_pk: employeeId,
          office_fk: formData.officePk,
          designation: formData.designation,
          is_active: formData.isActive,
        });
      }
    } finally {
      isSaving = false;
    }
  }
</script>

<Root
  bind:open={sheetContext.addDialogState}
  onOpenChangeComplete={async (isOpen) => {
    if (!TheContent) {
      TheContent = await delayComponentImport(() => import("./content.svelte"));
    }
  }}
>
  <LazyDialogContent class="w-[480px]" ready={TheContent}>
    {#snippet child({ class: className, flyIn })}
      <form {onsubmit} autocomplete="off" class={className} in:flyIn>
        <TheContent {isSaving} {hasOverlaps} />
      </form>
    {/snippet}
  </LazyDialogContent>
</Root>
