<script lang="ts">
  import AnimateContent from "$lib/components/animate-content.svelte";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import DateListDisplay from "$lib/components/display/date-list-display.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import type { DateValue } from "@internationalized/date";
  import { untrack } from "svelte";
  interface Props {
    overlapContracts: Contract[];
    startDate?: DateValue;
    endDate?: DateValue;
    numOfDays: string | null;
    hadOverlap: boolean;
  }

  let {
    overlapContracts = $bindable([]),
    startDate: startDateValue = $bindable(),
    endDate: endDateValue = $bindable(),
    numOfDays = $bindable(""),
    hadOverlap,
  }: Props = $props();

  let invalid = $state(false);

  $effect(() => {
    startDateValue;
    endDateValue;

    untrack(() => {
      if (!startDateValue || !endDateValue) {
        invalid = false;
        return;
      }

      document.getElementById("num_of_days")?.focus();
      invalid = false;
    });
  });
</script>

<DateRangePicker
  allRequired
  bind:startDateValue
  bind:endDateValue
  startDateInvalid={hadOverlap}
  endDateInvalid={hadOverlap}
/>

{#if overlapContracts.length}
  <AnimateContent>
    <div class="pt-3">
      <DateListDisplay
        sourceType="transmittal"
        contracts={overlapContracts}
        {startDateValue}
        {endDateValue}
      />
    </div>
  </AnimateContent>
{/if}

<div class="pt-4">
  <Label aria-required for="num_of_days" class="pb-1">Number of days</Label>
  <Input
    type="number"
    min={1}
    id="num_of_days"
    aria-invalid={invalid}
    bind:value={numOfDays}
    onfocusin={() => {
      if (!startDateValue || !endDateValue) return;
      if (!numOfDays || numOfDays === "0") invalid = true;
    }}
    onfocusout={() => {
      if (!numOfDays || numOfDays === "0") {
        invalid = true;
        return;
      }
      invalid = false;
    }}
  />

  {#if invalid}
    <AnimateContent>
      <div class="leading-4 text-sm text-destructive pt-1">
        This is required and must greater than 0
      </div>
    </AnimateContent>
  {/if}
</div>
