<script lang="ts">
  import { dateHelper } from "$lib/components/date/date-helper";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import DateListDisplay from "$lib/components/display/date-list-display.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import PositionCategorySelector from "$lib/components/position-category-selector.svelte";
  import StatusOfAppointmentSelector from "$lib/components/status-of-appointment-selector.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { Textarea } from "$lib/components/ui/textarea";
  import { apiFetch } from "$lib/utils";
  import { getSideSheetContentContext } from "$routes/employees/context.svelte";
  import { type DateValue, CalendarDate } from "@internationalized/date";
  import { untrack } from "svelte";
  import { fade, slide } from "svelte/transition";

  interface Props {
    isSaving?: boolean;
    resetFormAndValues?: () => void;
  }
  type OverlapResponse = {
    error: boolean;
    message: null | string;
    overlaps: Contract[];
  };

  let { isSaving = $bindable(false), resetFormAndValues = $bindable() }: Props =
    $props();

  const sheetContext = getSideSheetContentContext();

  // Form values
  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();
  let endMinDate: DateValue | undefined = $state();
  let officePk = $state("");
  let positionCategPk = $state("");
  let designation = $state("");
  let appointmentStatus = $state("");
  let remarks = $state("");
  let rate = $state("");
  let overlapContracts: Contract[] = $state([]);
  let hasOverlap = $state(false);

  resetFormAndValues = () => {
    sheetContext.selectedContract = null;
    hasOverlap = false;
    overlapContracts = [];

    startDateValue = undefined;
    endDateValue = undefined;
    officePk = "";
    positionCategPk = "";
    appointmentStatus = "";
    designation = "";
    rate = "";
  };

  $effect(() => {
    sheetContext.editDialogState;

    untrack(() => {
      if (!sheetContext.selectedContract || !sheetContext.editDialogState)
        return;

      const selectedContract = $state.snapshot(
        sheetContext.selectedContract,
      ) as ContractDirect;
      const [startyear, startmonth, startday] = dateHelper.parseDateParts(
        selectedContract.start_date,
      );
      const [endyear, endmonth, endday] = dateHelper.parseDateParts(
        selectedContract.end_date,
      );

      // Setting End Date Min Value
      endMinDate = new CalendarDate(startyear, startmonth, startday);

      startDateValue = new CalendarDate(startyear, startmonth, startday);
      endDateValue = new CalendarDate(endyear, endmonth, endday);
      officePk = selectedContract.office_fk?.toString() ?? "";
      positionCategPk = (
        selectedContract.position_category_fk ?? "null"
      )?.toString();
      designation = selectedContract.designation;
      appointmentStatus = selectedContract.appointment_status.toString();
      remarks = selectedContract.remarks || "";
      rate = (selectedContract.rate ?? "").toString();
    });
  });

  // CHECK OVERLAP
  $effect(() => {
    startDateValue;
    endDateValue;

    untrack(async () => {
      if (!sheetContext.selectedContract) return;

      // Setting End Date Min Value
      if (endMinDate) {
        const [year, month, day] = dateHelper.parseDateParts(
          endMinDate.toString(),
        );
        endMinDate = new CalendarDate(year, month, day);
      }
      const employeeId = sheetContext.selectedContract.employee_fk;

      if (!employeeId || !endDateValue || !startDateValue) return;

      const res = await apiFetch(
        `/api/employee/contract/check-overlap?employee_pk=${employeeId}`,
        {
          method: "POST",
          body: JSON.stringify({
            startDate: startDateValue.toString(),
            endDate: endDateValue.toString(),
          }),
        },
      );

      if (!res.ok) return;

      const overlapContractsData = (await res.json()) as OverlapResponse;
      const filteredContract = overlapContractsData.overlaps.filter(
        (c) => c.contract_pk !== sheetContext.selectedContract?.contract_pk,
      );

      overlapContracts = filteredContract;
      hasOverlap = filteredContract.length > 0;
    });
  });
</script>

<Dialog.Header>
  <Dialog.Title>Edit Contract</Dialog.Title>
  <Dialog.Description>
    Fields marked with asterisk &lpar;<span class="text-destructive">*</span
    >&rpar; are required.
  </Dialog.Description>
</Dialog.Header>

<div class="space-y-4 relative mt-2">
  <DateRangePicker
    allRequired
    bind:startDateValue
    bind:endDateValue
    bind:endMinDate
  />

  <div style="min-height: 322.95.13px; min-width: 413.5px;">
    {#if overlapContracts.length}
      <div transition:slide={{ axis: "y", delay: 300 }}>
        <div in:fade={{ delay: 400 }} out:fade>
          <DateListDisplay
            contracts={overlapContracts}
            {startDateValue}
            {endDateValue}
          />
        </div>
      </div>
    {:else}
      <div transition:slide={{ axis: "y", delay: 300 }}>
        <div in:fade={{ delay: 400 }} out:fade>
          <div class="flex flex-col gap-4">
            <div class="w-full">
              <Label class="flex flex-col gap-1 items-start">
                <div>
                  <span>Select Office</span>
                  <Asterisk />
                </div>
                <OfficeSelector
                  required
                  name="officePk"
                  bind:value={officePk}
                  width="w-[427px]"
                />
              </Label>
            </div>

            <div>
              <Label class="flex flex-col gap-1 items-start">
                <div>
                  <span>Select Position Category</span>
                </div>
                <PositionCategorySelector
                  name="positionCategoryFk"
                  width="w-[427px]"
                  bind:value={positionCategPk}
                />
              </Label>
            </div>

            <div>
              <Label for="designation" class="leading-6">
                <div>
                  <span>Designation</span>
                  <Asterisk />
                </div>
              </Label>
              <Textarea
                id="designation"
                name="designation"
                required
                autoHeight
                autoTrim
                onreset={resetFormAndValues}
                bind:value={designation}
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
              <Label for="rate" class="leading-6">
                <div>
                  <span>Rate</span>
                  <Asterisk />
                </div>
              </Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                min="100"
                required
                bind:value={rate}
              />
            </div>

            <div>
              <Label for="remarks" class="leading-6">
                <div>Remarks</div>
              </Label>

              <Textarea
                id="remarks"
                name="remarks"
                bind:value={remarks}
                autoHeight
                autoTrim
              />
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<Dialog.Footer class="mt-2">
  <Dialog.Close
    class={buttonVariants({ variant: "secondary" })}
    type="button"
    disabled={isSaving}>Cancel</Dialog.Close
  >
  <Button type="submit" disabled={isSaving || hasOverlap}>
    {#if isSaving}
      <Spinner />
    {/if}
    Save Changes
  </Button>
</Dialog.Footer>
