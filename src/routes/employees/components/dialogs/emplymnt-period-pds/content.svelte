<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import { type DateValue } from "@internationalized/date";
  import StatusOfAppointmentSelector from "$lib/components/status-of-appointment-selector.svelte";
  import PositionCategorySelector from "$lib/components/position-category-selector.svelte";
  import { untrack } from "svelte";
  import DateListDisplay from "$lib/components/display/date-list-display.svelte";
  import AnimateContent from "$lib/components/animate-content.svelte";
  import { getEmployeeContext } from "$routes/employees/context.svelte";
  import { apiFetch } from "$lib/utils";
  import ConflctPresentPds from "./conflct-present-pds.svelte";

  type OverlapResponse = {
    error: boolean;
    message: null | string;
    overlaps: Contract[];
  };
  interface Props {}

  let {}: Props = $props();

  const context = getEmployeeContext();
  let officeValue = $state("");
  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();
  let isPresent = $state(false);
  let positionCategPk = $state("");
  let overlapContracts: Contract[] = $state([]);
  let hasOverlap = $derived(!!overlapContracts.length);
  let startDateOfPresentContract: string | null = $state(null);

  let dateSelectorIsInvalid = $derived(
    !!startDateOfPresentContract || hasOverlap
  );

  // CHECK OVERLAP or PRESENT END DATE
  $effect(() => {
    startDateValue;
    endDateValue;
    isPresent;

    untrack(async () => {
      const empId = context.openEmployee?.employee_pk;

      if (!empId) return;

      // Get contract where the end_date si Present
      if (isPresent) {
        const res = await apiFetch(
          `/api/employee/contract/check-pds-present?employee_pk=${empId}`
        );

        if (!res.ok) return;

        const data = (await res.json()).data as ContractFromPDS;
        startDateOfPresentContract = data.start_date;
        overlapContracts = [];
        return;
      }

      // Check overlap
      if (!startDateValue || !endDateValue) return;
      startDateOfPresentContract = null;
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
      overlapContracts = overlapContractsData.overlaps;
    });
  });
</script>

<Dialog.Header>
  <Dialog.Title>
    Add Employment Period
    <span class="text-muted-foreground">&lpar;PDS&rpar;</span>
  </Dialog.Title>
  <Dialog.Description>
    Fields marked with asterisk &lpar;<span class="text-destructive">&ast;</span
    >&rpar; are required.
  </Dialog.Description>
</Dialog.Header>
<div class="relative w-[429.53px] min-h-[182px]">
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
      {#if startDateOfPresentContract}
        <AnimateContent>
          <ConflctPresentPds startDate={startDateOfPresentContract} />
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
            required
            autoHeight
            autoTrim
          />
        </div>

        <div>
          <Label for="rate" class="leading-6">Rate</Label>
          <Input id="rate" name="rate" type="number" min={100} />
        </div>

        <div>
          <Label class="flex-col items-start gap-1">
            <div>
              <span>Status of Appointment</span>
            </div>
            <StatusOfAppointmentSelector />
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
          <Textarea id="remarks" name="remarks" autoHeight autoTrim />
        </div>
      </div>
    </AnimateContent>
  {/if}
</div>
<Dialog.Footer>
  <Dialog.Close class={buttonVariants({ variant: "outline" })} type="button">
    Cancel
  </Dialog.Close>
  <Button type="submit" disabled={hasOverlap || !!startDateOfPresentContract}
    >Save changes</Button
  >
</Dialog.Footer>
