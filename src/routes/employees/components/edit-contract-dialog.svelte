<script lang="ts">
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import OfficeSelector from "$lib/components/office-selector.svelte";
  import PositionCategorySelector from "$lib/components/position-category-selector.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { Textarea } from "$lib/components/ui/textarea";
  import { type DateValue } from "@internationalized/date";
  import { toast } from "svelte-sonner";

  interface Props {
    open?: boolean;
    afterSave?: (contract: Contract) => void;
  }

  let { open = $bindable(false), afterSave }: Props = $props();
  let isSaving = $state(false);
  let startDateValue: DateValue | undefined = $state();

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();

    toast.success("Updated successfully");
    // afterSave?.(newContract);
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="sm:max-w-[480px]"
    escapeKeydownBehavior={isSaving ? "ignore" : "close"}
    interactOutsideBehavior={isSaving ? "ignore" : "close"}
    disableCloseButton={isSaving}
  >
    <form {onsubmit} class="grid gap-4" autocomplete="off">
      <Dialog.Header>
        <Dialog.Title>Edit Contract</Dialog.Title>
        <Dialog.Description>
          Fields marked with asterisk &lpar;<span class="text-destructive"
            >*</span
          >&rpar; are required.
        </Dialog.Description>
      </Dialog.Header>
      <div class="space-y-4 relative mt-2">
        <DateRangePicker allRequired required bind:startDateValue />

        <div>
          <Label class="flex flex-col gap-1 *:w-full">
            <div>
              <span>Select Office</span>
              {@render requiredAsterisk()}
            </div>
            <OfficeSelector required name="officePk" />
          </Label>
        </div>

        <div>
          <Label class="flex flex-col gap-1 *:w-full">
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
          <Textarea id="designation" name="designation" required />
        </div>

        <div>
          <Label for="rate" class="leading-6">
            <div>
              <span>Rate</span>
              {@render requiredAsterisk()}
            </div>
          </Label>
          <Input id="rate" name="rate" type="number" min="100" required />
        </div>

        <!-- <div class="pt-2">
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
        </div> -->
      </div>

      {#snippet requiredAsterisk()}
        <span class="text-destructive">*</span>
      {/snippet}

      <Dialog.Footer>
        <Dialog.Close
          class={buttonVariants({ variant: "secondary" })}
          disabled={isSaving}>Cancel</Dialog.Close
        >
        <Button type="submit" disabled={isSaving}>
          {#if isSaving}
            <Spinner />
          {/if}
          Save Changes
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
