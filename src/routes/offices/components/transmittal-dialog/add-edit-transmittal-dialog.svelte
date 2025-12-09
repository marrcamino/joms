<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { getOfficeContext } from "../../context.svelte";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import {
    getLocalTimeZone,
    today,
    type DateValue,
  } from "@internationalized/date";

  let startDateValue: DateValue | undefined = $state();
  let endDateValue: DateValue | undefined = $state();

  const context = getOfficeContext();
</script>

<Dialog.Root
  bind:open={context.transmittalDialogState}
  onOpenChangeComplete={(open) => {
    if (!open) {
      context.openOffice = null;
    }
  }}
>
  <Dialog.Content class="w-[460px]">
    <Dialog.Header>
      <Dialog.Title>Add Transmittal</Dialog.Title>
      <Dialog.Description>
        Make changes to your profile here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <div>
      <div>
        <DateRangePicker required bind:startDateValue bind:endDateValue />
      </div>
      <div class="space-y-2 mt-2">
        <div>
          <Label for="fund" class="leading-6">Funding Source</Label>
          <Input id="fund" placeholder="e.g., PGO B" />
        </div>

        <div>
          <Label class="flex flex-col gap-1 items-start">
            <div>
              <span>Select Office</span>
            </div>
            <OfficeSelector
              required
              name="officePk"
              value={String(context.openOffice?.office_pk)}
            />
          </Label>
        </div>
        <div>
          <Label for="days" class="leading-6">Number of Days</Label>
          <Input id="days" type="number" min={1} placeholder="e.g., 65" />
        </div>
      </div>
    </div>

    <Dialog.Footer>
      <Button type="submit">Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
