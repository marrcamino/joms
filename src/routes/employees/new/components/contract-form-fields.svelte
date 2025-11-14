<script lang="ts">
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import PositionCategorySelector from "$lib/components/position-category-selector.svelte";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { type DateValue } from "@internationalized/date";

  interface Props {
    required: boolean;
    asContentOnly?: boolean;
    activeContract?: boolean;
    allRequired?: boolean;
  }

  let {
    required = $bindable(false),
    asContentOnly,
    activeContract = $bindable(false),
    allRequired,
  }: Props = $props();

  let startDateValue: DateValue | undefined = $state();
  let isItReallyRequired = $derived(required && !!startDateValue);

  const dataAsContent = asContentOnly ? "" : null;
</script>

<div
  data-as-content={dataAsContent}
  class="py-4 shadow border px-4 rounded-xl bg-accent/10 space-y-4 data-[as-content]:mt-2 mt-6 relative data-[as-content]:rounded-none data-[as-content]:bg-background data-[as-content]:p-0 data-[as-content]:border-none"
>
  <div
    data-as-content={dataAsContent}
    class="data-[as-content]:hidden grid gap-2 [&_label]:leading-6"
  >
    <div class="pb-2">
      <div class="text-lg uppercase">
        Active Contract <span class="text-muted-foreground"
          >&lpar;Optional&rpar;</span
        >
      </div>
    </div>
  </div>

  <DateRangePicker
    required={isItReallyRequired}
    bind:startDateValue
    {allRequired}
  />

  <div>
    <Label class="flex flex-col gap-1 items-start">
      <div>
        <span>Select Office</span>
        {@render requiredAsterisk()}
      </div>
      <OfficeSelector required={isItReallyRequired} name="officePk" />
    </Label>
  </div>

  <div>
    <Label class="flex flex-col gap-1 items-start">
      <div>
        <span>Select Position Category</span>
        {@render requiredAsterisk()}
      </div>
      <PositionCategorySelector name="positionCategoryFk" />
    </Label>
  </div>

  <div>
    <Label for="designation" class="leading-6">
      <div>
        <span>Position</span>
        {@render requiredAsterisk()}
      </div>
    </Label>
    <Textarea
      id="designation"
      name="designation"
      required={isItReallyRequired}
    />
  </div>

  <div>
    <Label for="rate" class="leading-6">
      <div>
        <span>Rate</span>
        {@render requiredAsterisk()}
      </div>
    </Label>
    <Input
      id="rate"
      name="rate"
      type="number"
      min="100"
      required={isItReallyRequired}
    />
  </div>

  <div class="pt-2">
    <div class="flex gap-3">
      <input
        type="hidden"
        name="isActive"
        value={Number(activeContract).toString()}
      />
      <Checkbox id="isActive" bind:checked={activeContract} />
      <div>
        <Label for="isActive">Set this contract as active</Label>
        <div class="text-muted-foreground leading-5 mt-1">
          Marking this contract as active means it will be counted as the
          current employment period for this employee.
        </div>
      </div>
    </div>
  </div>
</div>

{#snippet requiredAsterisk()}
  {#if isItReallyRequired}
    <span class="text-destructive">*</span>
  {/if}
{/snippet}
