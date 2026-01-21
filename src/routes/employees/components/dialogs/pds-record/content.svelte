<script lang="ts">
  import AnimateContent from "$lib/components/animate-content.svelte";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import DateListDisplay from "$lib/components/display/date-list-display.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import PositionCategorySelector from "$lib/components/position-category-selector.svelte";
  import StatusOfAppointmentSelector from "$lib/components/status-of-appointment-selector.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { Textarea } from "$lib/components/ui/textarea";
  import { apiFetch, cDate } from "$lib/utils";

  import PdsRecordImpactNotice from "$lib/components/display/pds-record-impact-notice.svelte";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "$routes/employees/context.svelte";
  import { type DateValue } from "@internationalized/date";
  import { untrack } from "svelte";
  import ConflctPresentPds from "./conflct-present-pds.svelte";

  type FormReturn =
    | { type: "present"; data: ContractFromPDS }
    | { type: "overlaps"; data: ContractFromPDS[] };

  type OverlapResponse = {
    error: boolean;
    message: null | string;
    overlaps: Contract[];
  };
  interface Props {
    isSaving?: boolean;
    yeah?: string;
  }

  let { isSaving }: Props = $props();

  const context = getEmployeeContext();
  const sheetContext = getSideSheetContentContext();

  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();
  let isPresent = $state(false);
  let designation = $state("");
  let rate = $state("");
  let appointmentStatus = $state("");
  let positionCategPk = $state("");
  let officeValue = $state("");
  let remarks = $state("");

  let overlapContracts: Contract[] = $state([]);
  let hasOverlap = $derived(!!overlapContracts.length);
  let startDateOfPresentContract: string = $state("");
  let isBackdating = $state(false);

  let dateSelectorIsInvalid = $derived(
    !!startDateOfPresentContract || hasOverlap
  );

  // SETTING VALUES IN EDIT MODE
  $effect(() => {
    sheetContext.editPdsDialogState;
    untrack(() => {
      if (!sheetContext.editPdsDialogState || !sheetContext.selectedContract)
        return;

      const contract = sheetContext.selectedContract as ContractFromPDS;

      startDateValue = cDate.toDateValue(contract.start_date);
      if (contract.end_date) {
        endDateValue = cDate.toDateValue(contract.end_date);
      } else isPresent = true;
      designation = contract.designation;
      rate = contract.rate?.toString() ?? "";
      appointmentStatus = contract.appointment_status.toString();
      positionCategPk = contract.position_category_fk?.toString() ?? "null";
      officeValue = contract.office_fk?.toString() ?? "";
      remarks = contract.remarks ?? "";
    });
  });

  // CHECK OVERLAP or PRESENT END DATE
  $effect(() => {
    startDateValue;
    endDateValue;
    isPresent;

    untrack(async () => {
      const empId = context.openEmployee?.employee_pk;

      if (!startDateValue || !empId) return;
      const contract = sheetContext.selectedContract as ContractFromPDS | null;

      // Get contract where the end_date si Present
      if (isPresent) {
        const res = await apiFetch(
          `/api/employee/contract/check-pds-overlaps?employee_pk=${empId}&start_date=${startDateValue.toString()}`
        );

        if (!res.ok) return;

        const data = (await res.json()) as FormReturn;
        if (data.type === "present") {
          if (!(contract && data.data.contract_pk === contract.contract_pk)) {
            startDateOfPresentContract = data.data.start_date;
            overlapContracts = [];
            isBackdating = false;
          }
          return;
        }

        let contractsFromPDS = data.data;

        if (contract) {
          // IF EDIT MODE
          contractsFromPDS = contractsFromPDS.filter(
            (c) => c.contract_pk !== contract.contract_pk
          );
        }
        overlapContracts = contractsFromPDS;
        isBackdating = true;
        return;
      }

      // Check overlap
      if (!endDateValue) return;
      startDateOfPresentContract = "";
      isBackdating = false;
      const res = await apiFetch(
        `/api/employee/contract/check-overlap?employee_pk=${empId}&source_type=pds`,
        {
          method: "POST",
          body: JSON.stringify({
            startDate: startDateValue.toString(),
            endDate: endDateValue.toString(),
          }),
        }
      );

      if (!res.ok) return;

      const overlapContractsData = (await res.json()) as OverlapResponse;
      let contracts = overlapContractsData.overlaps;

      if (contract) {
        // IF EDIT MODE
        contracts = contracts.filter(
          (c) => c.contract_pk !== contract.contract_pk
        );
      }

      overlapContracts = contracts;
    });
  });
</script>

<Dialog.Header>
  <Dialog.Title>
    {#if sheetContext.selectedContract}
      Edit PDS Record
    {:else}
      Add New PDS Record
    {/if}
  </Dialog.Title>
  <Dialog.Description>
    Fields marked with asterisk &lpar;<span class="text-destructive">&ast;</span
    >&rpar; are required.
  </Dialog.Description>
</Dialog.Header>
<div class="relative w-[429.53px] min-h-[182px]">
  <PdsRecordImpactNotice />

  <DateRangePicker
    allRequired
    bind:startDateValue
    bind:endDateValue
    bind:isPresent
    startDateInvalid={dateSelectorIsInvalid}
    endDateInvalid={dateSelectorIsInvalid}
    allowPresent
  />
  {#if hasOverlap || startDateOfPresentContract}
    <div class="pt-2">
      {#if isBackdating || startDateOfPresentContract}
        <AnimateContent>
          <ConflctPresentPds
            startDate={startDateOfPresentContract}
            contracts={overlapContracts}
            {isBackdating}
          />
        </AnimateContent>
      {:else}
        <AnimateContent>
          <DateListDisplay
            sourceType="pds"
            contracts={overlapContracts}
            {startDateValue}
            {endDateValue}
          />
        </AnimateContent>
      {/if}
    </div>
  {:else}
    <AnimateContent>
      <div class="grid gap-4 pt-4">
        <div>
          <Label for="designation" class="leading-6" aria-required
            >Designation</Label
          >
          <Textarea
            id="designation"
            name="designation"
            bind:value={designation}
            onreset={() => (designation = "")}
            required
            autoHeight
            autoTrim
          />
        </div>

        <div>
          <Label for="rate" class="leading-6">Rate</Label>
          <Input
            id="rate"
            name="rate"
            type="number"
            min={100}
            bind:value={rate}
            onreset={() => (rate = "")}
          />
        </div>

        <div>
          <Label class="flex-col items-start gap-1">
            <div>
              <span>Status of Appointment</span>
            </div>
            <StatusOfAppointmentSelector
              name="appointment_status"
              bind:value={appointmentStatus}
            />
          </Label>
        </div>

        <div>
          <Label class="flex flex-col gap-1 items-start">
            <div>
              <span>Select Position Category</span>
            </div>
            <PositionCategorySelector
              width="w-[430px]"
              name="positionCategoryFk"
              bind:value={positionCategPk}
            />
          </Label>
        </div>

        <div>
          <Label class="flex-col items-start gap-1">
            <div>Office</div>
            <OfficeSelector
              bind:value={officeValue}
              allowNoOffice
              width="w-[430px]"
              name="officePk"
            />
          </Label>
        </div>

        <div>
          <Label for="remarks" class="leading-6">Remarks</Label>
          <Textarea
            id="remarks"
            name="remarks"
            autoHeight
            autoTrim
            bind:value={remarks}
            onreset={() => (remarks = "")}
          />
        </div>
      </div>
    </AnimateContent>
  {/if}
</div>
<Dialog.Footer>
  <Dialog.Close class={buttonVariants({ variant: "outline" })} type="button">
    Cancel
  </Dialog.Close>
  <Button
    type="submit"
    disabled={hasOverlap || !!startDateOfPresentContract || isSaving}
  >
    {#if isSaving}
      <Spinner />
    {/if}

    {#if sheetContext.selectedContract}
      Save Changes
    {:else}
      Add Record
    {/if}
  </Button>
</Dialog.Footer>
