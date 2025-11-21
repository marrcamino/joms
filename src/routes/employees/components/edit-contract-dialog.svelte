<script lang="ts">
  import { dateHelper } from "$lib/components/date/date-helper";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import PositionCategorySelector from "$lib/components/position-category-selector.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { Textarea } from "$lib/components/ui/textarea";
  import { apiFetch, normalizeFormData } from "$lib/utils";
  import { type DateValue, CalendarDate } from "@internationalized/date";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade, slide } from "svelte/transition";
  import { getSideSheetContentContext } from "../context.svelte";
  import OverlapContracts from "../new/components/overlap-contracts.svelte";

  interface Props {
    open?: boolean;
    contract?: Contract | null;
    afterUpdate?: (contract: Contract) => void;
  }
  type OverlapResponse = {
    error: boolean;
    message: null | string;
    overlaps: Contract[];
  };
  type FormData = {
    startDate: string;
    endDate: string;
    officePk: number;
    positionCategoryFk: null | number;
    designation: string;
    rate: number;
  };

  let { open = $bindable(false), afterUpdate }: Props = $props();

  const sheetContent = getSideSheetContentContext();
  let isSaving = $state(false);

  // Form values
  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();
  let endMinDate: DateValue | undefined = $state();
  let officePk = $state("");
  let positionCategPk = $state("");
  let positionTitle = $state("");
  let rate = $state("");
  let overlapContracts: Contract[] = $state([]);
  let hasOverlap = $state(false);

  function resetFormAndValues() {
    sheetContent.selectedContract = null;
    hasOverlap = false;
    overlapContracts = [];

    startDateValue = undefined;
    endDateValue = undefined;
    officePk = "";
    positionCategPk = "";
    positionTitle = "";
    rate = "";
  }

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    try {
      if (!sheetContent.selectedContract) return;

      const contract_pk = sheetContent.selectedContract.contract_pk;

      if (!contract_pk) {
        console.error("Walay id sa contract");
        return;
      }

      isSaving = true;

      const form = e.currentTarget as HTMLFormElement;
      const formData = normalizeFormData(form) as FormData;

      const res = await apiFetch(`/api/contract?contract_pk=${contract_pk}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        toast.error("An error occor while updading contract", {
          description: "Please try again",
        });
        return;
      }

      const updatedContract = {
        contract_pk,
        employee_fk: sheetContent.selectedContract.employee_fk,
        start_date: formData.startDate,
        end_date: formData.endDate,
        designation: formData.designation,
        rate: formData.rate,
        office_fk: formData.officePk,
        position_category_fk: formData.positionCategoryFk,
        is_active: sheetContent.selectedContract.is_active,
      };

      toast.success("Updated successfully");
      afterUpdate?.(updatedContract);
      open = false;
    } finally {
      isSaving = false;
    }
  }

  $effect(() => {
    open;

    untrack(() => {
      if (!sheetContent.selectedContract || !open) return;

      const selectedContract = sheetContent.selectedContract;
      const [startyear, startmonth, startday] = dateHelper.parseDateParts(
        selectedContract.start_date
      );
      const [endyear, endmonth, endday] = dateHelper.parseDateParts(
        selectedContract.end_date
      );

      // Setting End Date Min Value
      endMinDate = new CalendarDate(startyear, startmonth, startday);

      startDateValue = new CalendarDate(startyear, startmonth, startday);
      endDateValue = new CalendarDate(endyear, endmonth, endday);
      officePk = selectedContract.office_fk.toString();
      positionCategPk = (
        selectedContract.position_category_fk ?? "null"
      )?.toString();
      positionTitle = selectedContract.designation;
      rate = selectedContract.rate.toString();
    });
  });

  $effect(() => {
    startDateValue;
    endDateValue;

    untrack(async () => {
      if (!sheetContent.selectedContract) return;

      // Setting End Date Min Value
      if (endMinDate) {
        const [year, month, day] = dateHelper.parseDateParts(
          endMinDate.toString()
        );
        endMinDate = new CalendarDate(year, month, day);
      }
      const employeeId = sheetContent.selectedContract.employee_fk;

      if (!employeeId || !endDateValue || !startDateValue) return;

      const res = await apiFetch(
        `/api/employee/contract/check-overlap?employee_id=${employeeId}`,
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
      const filteredContract = overlapContractsData.overlaps.filter(
        (c) => c.contract_pk !== sheetContent.selectedContract?.contract_pk
      );

      overlapContracts = filteredContract;
      hasOverlap = filteredContract.length > 0;
    });
  });
</script>

<Dialog.Root
  bind:open
  onOpenChangeComplete={(isOpen) => {
    if (!isOpen) resetFormAndValues();
  }}
>
  <Dialog.Content
    class="sm:max-w-[480px]"
    escapeKeydownBehavior={isSaving ? "ignore" : "close"}
    interactOutsideBehavior={isSaving ? "ignore" : "close"}
    disableCloseButton={isSaving}
  >
    <form {onsubmit} class="grid gap-4 grow-0" autocomplete="off">
      <Dialog.Header>
        <Dialog.Title>Edit Contract</Dialog.Title>
        <Dialog.Description>
          Fields marked with asterisk &lpar;<span class="text-destructive"
            >*</span
          >&rpar; are required.
        </Dialog.Description>
      </Dialog.Header>
      <div class="space-y-4 relative mt-2">
        <DateRangePicker
          allRequired
          required
          bind:startDateValue
          bind:endDateValue
          bind:endMinDate
        />

        <div style="min-height: 322.95.13px; min-width: 440px;">
          {#if overlapContracts.length}
            <div transition:slide={{ axis: "y", delay: 300 }}>
              <div in:fade={{ delay: 400 }} out:fade>
                <OverlapContracts
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
                        {@render requiredAsterisk()}
                      </div>
                      <OfficeSelector
                        required
                        name="officePk"
                        bind:value={officePk}
                      />
                    </Label>
                  </div>

                  <div>
                    <Label class="flex flex-col gap-1 items-start">
                      <div>
                        <span>Select Position Category</span>
                        {@render requiredAsterisk()}
                      </div>
                      <PositionCategorySelector
                        name="positionCategoryFk"
                        bind:value={positionCategPk}
                      />
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
                      required
                      autoHeight={false}
                      bind:value={positionTitle}
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
                      required
                      bind:value={rate}
                    />
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      {#snippet requiredAsterisk()}
        <span class="text-destructive">*</span>
      {/snippet}

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
    </form>
  </Dialog.Content>
</Dialog.Root>
