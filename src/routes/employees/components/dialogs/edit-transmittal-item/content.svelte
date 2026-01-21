<script lang="ts">
  import AnimateContent from "$lib/components/animate-content.svelte";
  import Asterisk from "$lib/components/display/asterisk.svelte";
  import Link from "$lib/components/display/link.svelte";
  import StatusOfAppointmentSelector from "$lib/components/status-of-appointment-selector.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import type { APPOINTMENT_STATUS_KEY } from "$lib/constants";
  import { apiFetch } from "$lib/utils";
  import { getSideSheetContentContext } from "$routes/employees/context.svelte";
  import { Info } from "@lucide/svelte";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    redirectLink: string;
  }
  let { redirectLink: href = $bindable("") }: Props = $props();

  let designation = $state("");
  let rate = $state("");
  let appointmentStatus = $state("");
  let showAppointmentErr = $state(false);
  let isSaving = $state(false);
  const sheetContext = getSideSheetContentContext();

  async function getCounts(id: number) {
    const res = await apiFetch(
      `/api/transmittal-item/get-group-counts?transmittal_item_pk=${id}`,
    );

    if (!res.ok) return 0;

    return (await res.json()).counts as number;
  }

  async function update() {
    try {
      isSaving = true;

      const contract = $state.snapshot(
        sheetContext.selectedContract,
      ) as ContractFromTransmittal | null;

      if (!contract) return;

      const updateData = {
        designation,
        rate: Number(rate),
        appointment_status: Number(appointmentStatus) as APPOINTMENT_STATUS_KEY,
      };
      const res = await apiFetch(
        `/api/contract/update-patch?contract_pk=${contract.contract_pk}`,
        {
          method: "PATCH",
          body: JSON.stringify(updateData),
        },
      );

      if (!res.ok) {
        toast.error("There was an error while updating entry");
        return;
      }

      toast.success("Updated Successfully");

      sheetContext.update({ ...contract, ...updateData });
      sheetContext.editTransItemDialogState = false;
    } finally {
      isSaving = false;
    }
  }

  // For setting alert's dialog link
  $effect(() => {
    sheetContext.editTransItemDialogState;

    untrack(async () => {
      const contract = $state.snapshot(
        sheetContext.selectedContract,
      ) as ContractFromTransmittal | null;

      if (!sheetContext.editTransItemDialogState || !contract) return;

      const res = await apiFetch(
        `/api/transmittal-item?transmittal_item_pk=${contract.transmittal_item_fk}`,
      );

      if (!res.ok) return;

      const data = (await res.json()) as TransmittalItem | null;

      if (!data) return;

      href = `#/offices/${contract.office_fk}?transmittal=${data.transmittal_fk}&item=${contract.transmittal_item_fk}`;
    });
  });

  // GET COUNTS SA APPOINTMENTS
  $effect(() => {
    sheetContext.editTransItemDialogState;

    untrack(async () => {
      const contract = $state.snapshot(
        sheetContext.selectedContract,
      ) as ContractFromTransmittal | null;

      if (!sheetContext.editTransItemDialogState || !contract) return;
      const lastStatusId = contract.appointment_status.toString();
      designation = contract.designation;
      rate = contract.rate.toString();
      appointmentStatus = lastStatusId;

      const count = (await getCounts(contract.transmittal_item_fk)) > 1;
      if (count) {
        // Basig na change ni user before the disable becomes true
        appointmentStatus = lastStatusId;
        showAppointmentErr = true;
      }
    });
  });
</script>

<DialogHeader>
  <DialogTitle>Edit Transmittal Entry</DialogTitle>
  <DialogDescription>
    Fields marked with asterisk <Asterisk withParentheses /> are required.
  </DialogDescription>
</DialogHeader>

<div>
  {#if href}
    <AnimateContent innerDelay={500}>
      <Alert.Root variant="info">
        <Info />
        <Alert.Title class="line-clamp-none text-justify">
          Only basic information can be edited here. To update other details,
          please go to the
          <Link {href} target="_blank" tabindex={-1}>Transmittal page</Link>
        </Alert.Title>
      </Alert.Root>
    </AnimateContent>
  {/if}

  <div class="pt-4">
    <Label for="designation" class="leading-6" aria-required>Designation</Label>
    <Textarea id="designation" autoHeight autoTrim bind:value={designation} />
  </div>

  <div class="pt-4">
    <Label class="flex-col items-start gap-1">
      <div>
        <span>Status of Appointment</span>
      </div>
      <StatusOfAppointmentSelector
        name="appointment_status"
        bind:value={appointmentStatus}
        disabled={showAppointmentErr}
      />

      {#if showAppointmentErr}
        <AnimateContent>
          <Alert.Root
            variant="info"
            class="border-none gap-2! bg-transparent px-0 pb-1 pt-0"
          >
            <Info />
            <Alert.Title class="line-clamp-none text-justify leading-4">
              This entry shares its appointment status with other entries in the
              same transmittal and cannot be changed individually.
              <Link href={href.split("&")[0]} target="_blank" tabindex={-1}>
                See Details
              </Link>
            </Alert.Title>
          </Alert.Root>
        </AnimateContent>
      {/if}
    </Label>
  </div>

  <div class="pt-4">
    <Label for="rate" class="leading-6" aria-required>Rate</Label>
    <Input id="rate" type="number" min="1" bind:value={rate} required />
  </div>
</div>

<DialogFooter>
  <DialogClose disabled={isSaving}>Cancel</DialogClose>
  <Button type="submit" disabled={isSaving} onclick={update}>
    {#if isSaving}<Spinner />{/if}
    Update Entry
  </Button>
</DialogFooter>
