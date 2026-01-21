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
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "$routes/employees/context.svelte";
  import type { ComponentProps } from "svelte";
  import { toast } from "svelte-sonner";

  type FormData = {
    startDate: string;
    endDate: string;
    officePk: number;
    positionCategoryFk: null | number;
    designation: string;
    remarks: string | null;
    rate: number;
    appointment_status: 1 | 2;
  };

  let {
    isSaving = false,
    ...restProps
  }: ComponentProps<typeof import("./content.svelte").default> = $props();

  const context = getEmployeeContext();
  const sheetContext = getSideSheetContentContext();

  let TheContent: LazyContentType<typeof import("./content.svelte")> =
    $state(null);

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    try {
      const id = context.openEmployee?.employee_pk;

      if (!id) {
        console.error("Dili ma save walay id");
        return;
      }
      isSaving = true;

      const form = e.currentTarget as HTMLFormElement;
      const formData = normalizeFormData(form) as FormData;

      const newContract: Omit<ContractFromPDS, "contract_pk"> = {
        ...formData,
        employee_fk: id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        position_category_fk: formData.positionCategoryFk,
        created_at: nDate.getCurrentTimestamp,
        is_active: 0,
        source_type: "pds",
        office_fk: formData.officePk,
        transmittal_item_fk: null,
        appointment_status: formData.appointment_status,
      };

      // EDIT MODE
      if (sheetContext.selectedContract) {
        const res = await apiFetch(
          `/api/contract?contract_pk=${sheetContext.selectedContract.contract_pk}`,
          {
            method: "PUT",
            body: JSON.stringify(formData),
          },
        );

        if (!res.ok) {
          toast.error("An error occor while updading PDS Record", {
            description: "Please try again",
          });
          return;
        }

        toast.success("Updated successfully");
        sheetContext.update({
          contract_pk: sheetContext.selectedContract.contract_pk,
          ...newContract,
        });
        form.reset();
        sheetContext.editPdsDialogState = false;
        return;
      }

      // ADD MODE
      const res = await apiFetch(`/api/employee/contract?employee_id=${id}`, {
        method: "POST",
        body: JSON.stringify({ source_type: "pds", ...formData }),
      });

      if (!res.ok) {
        toast.error("Unable to save employment period");
        return;
      }

      const contract_pk = (await res.json()).contract_pk as number;

      toast.success("Successfully added");

      sheetContext.add({
        contract_pk,
        ...newContract,
      });
      sheetContext.editPdsDialogState = false;
      form.reset();
    } finally {
      isSaving = false;
    }
  }
</script>

<Root
  bind:open={sheetContext.editPdsDialogState}
  onOpenChangeComplete={async (isOpen) => {
    if (!isOpen) sheetContext.selectedContract = null; //Setting null after when in edit mode

    if (!TheContent) {
      TheContent = await delayComponentImport(() => import("./content.svelte"));
    }
  }}
>
  <LazyDialogContent class="w-[480px]" ready={TheContent}>
    {#snippet child({ class: className, flyIn })}
      <form {onsubmit} autocomplete="off" class={className} in:flyIn>
        <TheContent {...restProps} {isSaving} />
      </form>
    {/snippet}
  </LazyDialogContent>
</Root>
