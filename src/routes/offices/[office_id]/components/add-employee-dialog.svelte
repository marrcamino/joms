<script lang="ts">
  import AnimateContent from "$lib/components/animate-content.svelte";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import DateListDisplay from "$lib/components/display/date-list-display.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { TransmittalContractItems } from "$lib/types";
  import { apiFetch, cDate } from "$lib/utils";
  import type { DateValue } from "@internationalized/date";
  import { CircleAlert } from "@lucide/svelte";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade, slide } from "svelte/transition";
  import {
    getDraftTransmittalContext,
    type EmployeeAndTransmittalInfo,
  } from "../../components/transmittal-dialog/context.svelte";
  import Designation from "../../components/transmittal-dialog/designation.svelte";
  import SearchEmployeeCombobox from "../../components/transmittal-dialog/search-employee-combobox.svelte";
  import { getOfficeAllTransmittalContext } from "../context.svelte";

  interface Props {
    /** This will work the `singleSave` props is true*/
    afterAdd?: (trans: TransmittalContractItems) => void;
    /** This will work the `singleSave` props is true*/
    afterUpdate?: (trans: TransmittalContractItems) => void;
    /** Mo save og single employee sa existing transmittal*/
    singleSave?: boolean;
  }

  let { afterAdd, singleSave, afterUpdate }: Props = $props();

  type OverlapResponse = {
    error: boolean;
    message: null | string;
    overlaps: Contract[];
  };

  const drfTransCtx = getDraftTransmittalContext();
  const officeAllTransCtx = getOfficeAllTransmittalContext();

  let employee: null | Employee = $state(null);
  let employeePk = $state("");
  let empSearchIsDisable = $state(false);
  let designation = $state("");
  let rate = $state("");
  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();
  let fundingSource = $state("");
  let officeAssign = $state("");
  let numOfDays = $state("");
  let isFocus = $state(false);

  let fundingSourceHaveCommna = $derived(fundingSource.includes(","));

  let overlapContracts: Contract[] = $state([]);
  let hadOverlap = $derived(overlapContracts.length > 0);
  let isChecking = $state(false);

  // Searching duplicate employee
  let isSearching = $state(false);
  let sumbitDisable = $derived(
    isSearching || fundingSourceHaveCommna || hadOverlap || isChecking
  );

  function resetFormValues() {
    employeePk = "";
    designation = "";
    rate = "";
    startDateValue = undefined;
    endDateValue = undefined;
    fundingSource = "";
    officeAssign = String(drfTransCtx.office?.office_pk) ?? "";
    numOfDays = "";
    overlapContracts = [];
    employee = null;
    empSearchIsDisable = false;
  }

  async function saveSingleEmployee() {
    const res = await apiFetch(
      `/api/transmittal/transmittal_item?transmittal_fk=${officeAllTransCtx.openTransmittal!.transmittal_pk}`,
      {
        method: "POST",
        body: JSON.stringify({
          employee_fk: Number(employeePk),
          start_date: startDateValue?.toString(),
          end_date: endDateValue?.toString(),
          designation,
          rate: Number(rate),
          office_fk: Number(officeAssign),
          position_category_fk: null,
          fund_charge: fundingSource,
          num_of_days: numOfDays,
        }),
      }
    );

    if (!res.ok) {
      toast.error("Unable to save employee", {
        description: "Please try again",
      });
      return;
    }

    const data = (await res.json()) as TransmittalContractItems;
    afterAdd?.(data);
    toast.success("Employee added", {
      description: "Successfully included in this transmittal",
    });
    drfTransCtx.addEmpDialogState = false;
  }

  async function updateTransmittalItem(
    transmittal_item_fk: number,
    data: Omit<EmployeeAndTransmittalInfo, "uuid">
  ) {
    const res = await apiFetch(
      `/api/transmittal-item?transmittal_item_pk=${transmittal_item_fk}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          start_date: data.start_date,
          end_date: data.end_date,
          designation: data.designation,
          rate: Number(data.rate),
          office_fk: Number(data.office_fk),
          fund_charge: data.fund_charge,
          num_of_days: data.num_of_days,
        }),
      }
    );

    if (!res.ok) {
      toast.error("Unable to update employee", {
        description: "Please try again",
      });
      return;
    }

    toast.success("Successfully Updated");
    const d = (await res.json()) as TransmittalContractItems;
    afterUpdate?.(d);
    drfTransCtx.addEmpDialogState = false;
  }

  async function onsubmit(e: SubmitEvent) {
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

    if (singleSave && officeAllTransCtx.openTransmittal) {
      const transmittal_item_fk =
        drfTransCtx.empTranToEdit?.transmittal_item_fk;

      if (transmittal_item_fk) {
        updateTransmittalItem(transmittal_item_fk, newEmp);
        return;
      }

      saveSingleEmployee();
      return;
    }

    if (drfTransCtx.empTranToEdit) {
      drfTransCtx.update({
        ...newEmp,
        uuid: drfTransCtx.empTranToEdit.uuid,
      });
    } else drfTransCtx.add(newEmp);

    drfTransCtx.addEmpDialogState = false;
    resetFormValues();
  }

  // Setting autofill value
  $effect(() => {
    drfTransCtx.addEmpDialogState;

    untrack(() => {
      if (!drfTransCtx.addEmpDialogState || drfTransCtx.empTranToEdit) return;
      const empTrans = drfTransCtx.firstEmp;

      if (!empTrans) return;
      // console.log($state.snapshot(empTrans).office_fk);

      startDateValue = cDate.toDateValue(empTrans.start_date);
      endDateValue = cDate.toDateValue(empTrans.end_date);
      fundingSource = empTrans.fund_charge;
      numOfDays = empTrans.num_of_days;
    });
  });

  // Setting values if on edit mode
  $effect(() => {
    drfTransCtx.addEmpDialogState;

    //Setting fields when edting mode
    untrack(() => {
      if (!drfTransCtx.addEmpDialogState || !drfTransCtx.empTranToEdit) return;
      const et = drfTransCtx.empTranToEdit;

      empSearchIsDisable = true;
      designation = et.designation;
      rate = et.rate;
      startDateValue = cDate.toDateValue(et.start_date);
      endDateValue = cDate.toDateValue(et.end_date);
      fundingSource = et.fund_charge;
      numOfDays = et.num_of_days;
      officeAssign = et.office_fk;
    });
  });

  // Setting Office Assign Id
  $effect(() => {
    drfTransCtx.addEmpDialogState;

    untrack(() => {
      if (drfTransCtx.empTrans.length) {
        officeAssign = String(drfTransCtx.empTrans[0].office_fk);
        return;
      }
      officeAssign = String(drfTransCtx.office?.office_pk) ?? "";
    });
  });

  // Checks overlaps dates of transmittal
  $effect(() => {
    startDateValue;
    endDateValue;
    employee;

    untrack(async () => {
      if (!employee || !startDateValue || !endDateValue) return;

      try {
        isChecking = true;
        const res = await apiFetch(
          `/api/employee/contract/check-overlap?employee_pk=${employee.employee_pk}&source_type=transmittal`,
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

        let theOverlapContracts = overlapContractsData.overlaps;

        const transmittal_item_fk =
          drfTransCtx.empTranToEdit?.transmittal_item_fk;

        if (drfTransCtx.noOverlapCheck && transmittal_item_fk) {
          theOverlapContracts = theOverlapContracts.filter(
            (t) => t.position_category_fk === transmittal_item_fk
          );
        }

        overlapContracts = theOverlapContracts;
      } finally {
        isChecking = false;
      }
    });
  });
</script>

<Dialog.Root
  bind:open={drfTransCtx.addEmpDialogState}
  onOpenChangeComplete={(open) => {
    if (!open) {
      resetFormValues();
      drfTransCtx.empTranToEdit = null;
      drfTransCtx.noOverlapCheck = false;
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
          {drfTransCtx.empTranToEdit
            ? "Update Employee"
            : "Add Employee"}</Dialog.Title
        >
        <Dialog.Description
          >All fields marked with asterisk &lpar;<span class="text-destructive"
            >*</span
          >&rpar; are required
        </Dialog.Description>
      </Dialog.Header>
      <div>
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
              disabled={empSearchIsDisable}
              name="employee_fk"
            />
          </Label>
          {#if empSearchIsDisable}
            <AnimateContent>
              <div
                class="text-sm px-1 italic text-yellow-600 pb-2 flex gap-1 items-center"
              >
                <CircleAlert class="size-3.5" />
                <span> You can't change employee while updating </span>
              </div>
            </AnimateContent>
          {/if}
        </div>

        {#if !overlapContracts.length}
          <AnimateContent>
            <div class="space-y-4 pt-2">
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
                <Input
                  id="rate"
                  type="number"
                  min="1"
                  bind:value={rate}
                  required
                />
              </div>
            </div>
          </AnimateContent>
        {/if}

        <div class="pt-4">
          <DateRangePicker
            allRequired
            bind:startDateValue
            bind:endDateValue
            startDateInvalid={hadOverlap}
            endDateInvalid={hadOverlap}
            startDateLabel="Contract Start Date"
            endDateLabel="Contract End Date"
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
        </div>

        {#if !overlapContracts.length}
          <AnimateContent>
            <div class="space-y-4 pt-4">
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
                    Office Assignment <span class="ml=1 text-destructive"
                      >*</span
                    >
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
          </AnimateContent>
        {/if}
      </div>
      <Dialog.Footer>
        <Dialog.Close>Cancel</Dialog.Close>
        <Button disabled={sumbitDisable} type="submit">
          {drfTransCtx.empTranToEdit ? "Update" : "Add Employee"}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
