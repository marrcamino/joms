<script lang="ts">
  import AnimateContent from "$lib/components/animate-content.svelte";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import DateListDisplay from "$lib/components/display/date-list-display.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import PositionCategorySelector from "$lib/components/position-category-selector.svelte";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { apiFetch } from "$lib/utils";
  import {
    getLocalTimeZone,
    today,
    type DateValue,
  } from "@internationalized/date";
  import { untrack } from "svelte";
  import { fade, slide } from "svelte/transition";
  import TextareaRemarks from "./textarea-remarks.svelte";

  interface Props {
    required: boolean;
    asContentOnly?: boolean;
    activeContract?: boolean;
    /** Force all fields to be required, specially the dates*/
    allRequired?: boolean;
    hasActiveContract?: boolean;
    hadOverlap?: boolean;
    employeeId?: number;
    /** A tailwind class for setting selector's width*/
    width?: string;
  }

  let {
    required = $bindable(false),
    asContentOnly,
    activeContract = $bindable(false),
    allRequired,
    hasActiveContract,
    hadOverlap = $bindable(false),
    employeeId,
    width = "w-[413.5px]",
  }: Props = $props();
  type OverlapResponse = {
    error: boolean;
    message: null | string;
    overlaps: Contract[];
  };

  const defaultErrorMessage = `Activating this contract sets it as the current employment period.`;

  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();
  let isItReallyRequired = $derived(required && !!startDateValue);
  let disableCheckbox = $state(false);
  let errorMessage = $state(defaultErrorMessage);
  let overlapContracts: Contract[] = $state([]);

  const now = today(getLocalTimeZone());
  const dataAsContent = asContentOnly ? "" : null;

  $effect(() => {
    endDateValue;

    untrack(() => {
      if (hasActiveContract) {
        activeContract = false;
        disableCheckbox = true;
        errorMessage = `There’s already an active contract. Only one contract can be active at a time.`;
        return;
      }

      if (!endDateValue) {
        disableCheckbox = false;
        errorMessage = defaultErrorMessage;
        return;
      }

      const isPassed = endDateValue.compare(now);
      if (isPassed < 0) {
        activeContract = false;
        disableCheckbox = true;

        errorMessage = `You can’t activate this contract because its end date has already passed.`;
        return;
      }

      disableCheckbox = false;
      errorMessage = defaultErrorMessage;
    });
  });

  $effect(() => {
    startDateValue;
    endDateValue;

    untrack(async () => {
      if (!employeeId || !endDateValue || !startDateValue) return;

      const res = await apiFetch(
        `/api/employee/contract/check-overlap?employee_pk=${employeeId}`,
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
      hadOverlap = overlapContractsData.overlaps.length > 0;
    });
  });
</script>

<div
  data-as-content={dataAsContent}
  class="py-4 shadow border data-[as-content]:shadow-none px-4 rounded-xl bg-accent/10 space-y-4 data-[as-content]:mt-2 mt-6 relative data-[as-content]:rounded-none data-[as-content]:bg-background data-[as-content]:p-0 data-[as-content]:border-none"
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
    bind:endDateValue
    startDateInvalid={!!overlapContracts.length}
    endDateInvalid={!!overlapContracts.length}
    {allRequired}
  />

  <div style="min-width: 410px;">
    {#if overlapContracts.length}
      <AnimateContent>
        <DateListDisplay
          contracts={overlapContracts}
          {startDateValue}
          {endDateValue}
        />
      </AnimateContent>
    {:else}
      <AnimateContent>
        <div class="flex flex-col gap-4">
          <div>
            <Label class="flex flex-col gap-1 items-start">
              <div>
                <span>Select Office</span>
                {@render requiredAsterisk()}
              </div>
              <OfficeSelector
                required={isItReallyRequired}
                name="officePk"
                {width}
              />
            </Label>
          </div>

          <div>
            <Label class="flex flex-col gap-1 items-start">
              <div>
                <span>Select Position Category</span>
              </div>
              <PositionCategorySelector name="positionCategoryFk" {width} />
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
              autoHeight
              autoTrim
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

          <div>
            <Label for="remarks" class="leading-6">
              <div>Remarks</div>
            </Label>
            <TextareaRemarks />
          </div>

          <div class="pt-2">
            <div class="flex gap-3">
              <input
                type="hidden"
                name="isActive"
                value={Number(activeContract).toString()}
              />
              <Checkbox
                id="isActive"
                disabled={disableCheckbox}
                bind:checked={activeContract}
                title={disableCheckbox ? "checkbox is disabled" : null}
              />
              <div>
                <Label
                  for="isActive"
                  aria-disabled={disableCheckbox}
                  title={disableCheckbox ? "checkbox is disabled" : null}
                  class="aria-disabled:text-muted-foreground aria-disabled:cursor-not-allowed w-max"
                  >Set this contract as active</Label
                >
                <div
                  aria-invalid={disableCheckbox ? "true" : undefined}
                  class="transition-colors aria-[invalid]:text-yellow-600 text-muted-foreground leading-5 mt-1"
                  style="max-height: 42.5px; overflow: hidden;"
                >
                  {#key errorMessage}
                    <div
                      in:slide={{ axis: "y" }}
                      out:slide={{ axis: "y", delay: 400 }}
                    >
                      <div in:fade={{ delay: 500 }} out:fade>
                        {errorMessage}
                      </div>
                    </div>
                  {/key}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimateContent>
    {/if}
  </div>
</div>

{#snippet requiredAsterisk()}
  {#if isItReallyRequired}
    <span class="text-destructive">*</span>
  {/if}
{/snippet}
