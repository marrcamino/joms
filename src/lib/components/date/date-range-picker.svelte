<script lang="ts">
  import { CalendarDate, type DateValue } from "@internationalized/date";
  import { Label } from "../ui/label";
  import DatePicker from "./date-picker.svelte";
  import { dateHelper } from "./helper";

  interface Props {
    required?: boolean;
    startDateValue?: DateValue;
    endDateValue?: DateValue;
    allRequired?: boolean;
    onValueChange?: (dates: {
      startDate: DateValue | undefined;
      endDate: DateValue | undefined;
    }) => void;
  }

  let {
    required,
    allRequired,
    onValueChange,
    startDateValue = $bindable(),
    endDateValue = $bindable(),
  }: Props = $props();

  // let startDateValue: DateValue | undefined = $state();
  // let endDateValue: DateValue | undefined = $state();
  let endDateOpenState = $state(false);
  let endDateMinDate: CalendarDate | undefined = $derived(undefined);
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

    endDateMinDate = minDate;
    endDatePlaceholder = minDate;
  }
</script>

<div class="grid grid-cols-2 gap-2">
  <Label class="flex flex-col gap-1 *:w-full">
    <div>
      <span>Start Date</span>
      {#if allRequired}
        <span class="text-destructive">*</span>
      {/if}
    </div>
    <div>
      <DatePicker
        bind:value={startDateValue}
        closeOnDateSelect
        name="startDate"
        required={allRequired}
        maxDate={dateHelper.getToday}
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
      <span>End Date</span>
      {#if allRequired ? true : !!startDateValue && required}
        <span class="text-destructive">*</span>
      {/if}
    </div>
    <div>
      <DatePicker
        closeOnDateSelect
        name="endDate"
        required={allRequired ? true : !!startDateValue && required}
        minDate={endDateMinDate}
        bind:value={endDateValue}
        bind:open={endDateOpenState}
        bind:placeholder={endDatePlaceholder}
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
