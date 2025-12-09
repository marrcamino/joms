<script lang="ts">
  import { CalendarDate, type DateValue } from "@internationalized/date";
  import { Label } from "../ui/label";
  import DatePicker from "./date-picker.svelte";

  interface Props {
    required?: boolean;
    allRequired?: boolean;
    // Values
    startDateValue?: DateValue;
    endDateValue?: DateValue;
    // Min Value
    startMaxDate?: DateValue;
    endMaxDate?: DateValue;
    // Max Value
    endMinDate?: DateValue;
    startMinDate?: DateValue;
    // Invalid State
    startDateInvalid?: boolean;
    endDateInvalid?: boolean;
    // labels
    startDateLabel?: string;
    endDateLabel?: string;
    //Trigger Refferences
    startDateRef?: HTMLButtonElement | null;
    endDateRef?: HTMLButtonElement | null;
    onValueChange?: (dates: {
      startDate: DateValue | undefined;
      endDate: DateValue | undefined;
    }) => void;
  }

  let {
    required,
    allRequired,
    onValueChange,
    // Values
    startDateValue = $bindable(),
    endDateValue = $bindable(),
    // Min Value
    startMaxDate = $bindable(),
    endMaxDate = $bindable(),
    // Max Value
    startMinDate = $bindable(),
    endMinDate = $bindable(),
    //Invalid State
    startDateInvalid,
    endDateInvalid,
    // labels
    startDateLabel = "Start Date",
    endDateLabel = "End Date",
    //Trigger Refferences
    startDateRef = $bindable(null),
    endDateRef = $bindable(null),
  }: Props = $props();

  let endDateOpenState = $state(false);
  // let endMinDate: CalendarDate | undefined = $derived(undefined);
  let endDatePlaceholder: DateValue | undefined = $state();

  /** This will set/reset end date's value and placeholder*/
  function setEndDateValues(): CalendarDate | undefined {
    if (!startDateValue) return;
    const { year, month, day } = startDateValue;
    const minDate = new CalendarDate(year, month, day);

    // Compare if endDateMinDate is not undefined and not overlapping to the start date
    // If does, the end date value will reset
    if (minDate && endDateValue) {
      const result = endDateValue.compare(startDateValue);
      if (result < 0) endDateValue = undefined; // -1 = A < B, 1 = A > B, 0 = same day
    }

    endMinDate = minDate;
    endDatePlaceholder = minDate;
  }
</script>

<div class="grid grid-cols-2 gap-2">
  <Label class="flex flex-col gap-1 *:w-full">
    <div>
      <span>{startDateLabel}</span>
      {#if allRequired}
        <span class="text-destructive">*</span>
      {/if}
    </div>
    <div>
      <DatePicker
        name="startDate"
        closeOnDateSelect
        required={allRequired}
        bind:ref={startDateRef}
        bind:value={startDateValue}
        bind:maxDate={startMaxDate}
        bind:minDate={startMinDate}
        ariaInvalid={startDateInvalid}
        onValueChange={() => {
          if (startDateValue) {
            setEndDateValues();
            endDateOpenState = true;
          }
          onValueChange?.({ startDate: startDateValue, endDate: endDateValue });
        }}
        triggerOptions={{
          withIcon: false,
          label: "Select Start Date",
        }}
      />
    </div>
  </Label>

  <Label
    class="flex flex-col gap-1 w-full *:w-full aria-[disabled]:pointer-events-none aria-[disabled]:cursor-not-allowed"
    aria-disabled={startDateValue ? undefined : true}
  >
    <div>
      <span>{endDateLabel}</span>
      {#if allRequired ? true : !!startDateValue && required}
        <span class="text-destructive">*</span>
      {/if}
    </div>
    <div>
      <DatePicker
        closeOnDateSelect
        name="endDate"
        required={allRequired ? true : !!startDateValue && required}
        bind:ref={endDateRef}
        bind:minDate={endMinDate}
        bind:maxDate={endMaxDate}
        bind:value={endDateValue}
        bind:open={endDateOpenState}
        bind:placeholder={endDatePlaceholder}
        ariaInvalid={endDateInvalid}
        disabled={!startDateValue}
        triggerOptions={{
          withIcon: false,
          label: "Select End Date",
        }}
        onValueChange={() => {
          onValueChange?.({ startDate: startDateValue, endDate: endDateValue });
        }}
      />
    </div>
  </Label>
</div>
