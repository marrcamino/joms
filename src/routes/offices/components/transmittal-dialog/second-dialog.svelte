<script lang="ts">
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { cDate } from "$lib/utils";
  import { getOfficeContext } from "$routes/offices/context.svelte";
  import type { DateValue } from "@internationalized/date";
  import { untrack } from "svelte";
  import {
    getTransmittalContext,
    type EmployeeAndTransmittalInfo,
  } from "./context.svelte";
  import Designation from "./designation.svelte";
  import SearchEmployeeCombobox from "./search-employee-combobox.svelte";
  import { CircleAlert } from "@lucide/svelte";
  import { fade, slide } from "svelte/transition";

  const transContext = getTransmittalContext();
  const context = getOfficeContext();

  let employee: null | Employee = $state(null);
  let employeePk = $state("");
  let designation = $state("");
  let rate = $state("");
  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();
  let fundingSource = $state("");
  let officeAssign = $state(String(context.openOffice?.office_pk) ?? "");
  let numOfDays = $state("");
  let isFocus = $state(false);
  let fundingSourceHaveCommna = $derived(fundingSource.includes(","));

  // Searching duplicate employee
  let isSearching = $state(false);

  function resetFormValues() {
    employeePk = "";
    designation = "";
    rate = "";
    startDateValue = undefined;
    endDateValue = undefined;
    fundingSource = "";
    officeAssign = String(context.openOffice?.office_pk) ?? "";
    numOfDays = "";
  }

  function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!employee) return;

    let newEmp: Omit<EmployeeAndTransmittalInfo, "uuid"> = {
      employee_fk: Number(employeePk),
      firstname: employee.firstname,
      lastname: employee.lastname,
      middlename: employee.middlename,
      extension: employee.extension,
      designation,
      rate,
      start_date: startDateValue?.toString()!,
      end_date: endDateValue?.toString()!,
      fund_charge: fundingSource,
      office_fk: officeAssign,
      num_of_days: numOfDays,
    };

    if (transContext.empTranToEdit) {
      transContext.update({ ...newEmp, uuid: transContext.empTranToEdit.uuid });
    } else transContext.add(newEmp);

    transContext.secondDialogState = false;
    resetFormValues();
  }

  $effect(() => {
    transContext.secondDialogState;

    // Setting autofill value
    untrack(() => {
      if (!transContext.secondDialogState || transContext.empTranToEdit) return;
      const empTrans = transContext.firstEmp;
      if (!empTrans) return;

      startDateValue = cDate.toDateValue(empTrans.start_date);
      endDateValue = cDate.toDateValue(empTrans.end_date);
      fundingSource = empTrans.fund_charge;
      numOfDays = empTrans.num_of_days;
    });
  });

  $effect(() => {
    transContext.secondDialogState;

    //Setting fields when edting mode
    untrack(() => {
      if (!transContext.secondDialogState || !transContext.empTranToEdit)
        return;
      const et = transContext.empTranToEdit;

      designation = et.designation;
      rate = et.rate;
      startDateValue = cDate.toDateValue(et.start_date);
      endDateValue = cDate.toDateValue(et.end_date);
      fundingSource = et.fund_charge;
      numOfDays = et.num_of_days;
      officeAssign = et.office_fk;
    });
  });
</script>

<Dialog.Root
  bind:open={transContext.secondDialogState}
  onOpenChangeComplete={(open) => {
    if (!open) {
      resetFormValues();
      transContext.empTranToEdit = null;
    }
  }}
>
  <Dialog.Content
    class="sm:max-w-[425px] block"
    escapeKeydownBehavior={isFocus ? "ignore" : "close"}
  >
    <form {onsubmit} class="grid gap-4" autocomplete="off">
      <Dialog.Header>
        <Dialog.Title>
          {transContext.empTranToEdit
            ? "Update Employee"
            : "Add Employee"}</Dialog.Title
        >
        <Dialog.Description
          >All fields marked with asterisk &lpar;<span class="text-destructive"
            >*</span
          >&rpar; are required</Dialog.Description
        >
      </Dialog.Header>
      <div class="space-y-4">
        <div>
          <Label class="flex-col gap-1.5">
            <div class="text-left w-full">
              Employee <span class="ml=1 text-destructive">*</span>
            </div>
            <SearchEmployeeCombobox
              required
              bind:employee
              bind:isSearching
              bind:value={employeePk}
              name="employee_fk"
            />
          </Label>
        </div>

        <div>
          <Label for="designation" class="leading-6" aria-required
            >Designation</Label
          >
          <Designation
            bind:value={designation}
            bind:isFocus
            {employeePk}
            onClickUse={(contract) => {
              rate = contract.rate.toString();
              document.getElementById("rate")?.focus();
            }}
          />
        </div>

        <div>
          <Label for="rate" class="leading-6" aria-required>Rate</Label>
          <Input id="rate" type="number" min="1" bind:value={rate} required />
        </div>

        <div>
          <DateRangePicker
            allRequired
            bind:startDateValue
            bind:endDateValue
            startDateLabel="Contract Start Date"
            endDateLabel="Contract End Date"
          />
        </div>

        <div>
          <div>
            <Label for="source" class="leading-6" aria-required
              >Funding Source</Label
            >
            <Input
              id="source"
              required
              bind:value={fundingSource}
              aria-invalid={fundingSourceHaveCommna}
            />
          </div>
          {#if fundingSourceHaveCommna}
            <div
              in:slide={{ duration: 200 }}
              out:slide={{ delay: 200, duration: 200 }}
            >
              <div
                in:fade={{ delay: 100, duration: 200 }}
                out:fade={{ duration: 200 }}
              >
                <p
                  class="text-sm italic text-destructive flex items-center gap-1 leading-7"
                >
                  <CircleAlert class="size-3.5" />
                  <span>Funding Source cannot contain commas</span>
                </p>
              </div>
            </div>
          {/if}
        </div>

        <div>
          <Label class="flex-col gap-1.5">
            <div class="text-left w-full">
              Office Assignment <span class="ml=1 text-destructive">*</span>
            </div>
            <OfficeSelector width="w-[373px]" bind:value={officeAssign} />
          </Label>
        </div>

        <div>
          <Label for="numOfDays" class="leading-6" aria-required>
            Number of Days
          </Label>
          <Input
            id="numOfDays"
            type="number"
            min="1"
            required
            bind:value={numOfDays}
          />
        </div>
      </div>
      <Dialog.Footer>
        <Dialog.Close>Cancel</Dialog.Close>
        <Button disabled={isSearching || fundingSourceHaveCommna} type="submit"
          >{transContext.empTranToEdit ? "Update" : "Add Employee"}</Button
        >
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
