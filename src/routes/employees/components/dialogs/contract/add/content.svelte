<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "$routes/employees/context.svelte";
  import ContractFormFields from "$routes/employees/new/components/contract-form-fields.svelte";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";

  interface Props {
    hasOverlaps: boolean;
    isSaving: boolean;
  }

  let { hasOverlaps, isSaving }: Props = $props();

  const sheetContent = getSideSheetContentContext();
  const context = getEmployeeContext();
</script>

<Dialog.Header>
  <Dialog.Title>Add New Contract</Dialog.Title>
  <Dialog.Description>
    Fields marked with asterisk &lpar;<span class="text-destructive">*</span
    >&rpar; are required.
  </Dialog.Description>
</Dialog.Header>

<ContractFormFields
  required
  asContentOnly
  allRequired
  hasActiveContract={sheetContent.hasActiveContract}
  employeeId={context.openEmployee?.employee_pk}
  bind:hadOverlap={hasOverlaps}
  width="w-[429.53px]"
/>
<Dialog.Footer>
  <Dialog.Close
    disabled={isSaving}
    type="button"
    class={buttonVariants({ variant: "secondary" })}>Cancel</Dialog.Close
  >
  <Button type="submit" disabled={isSaving || hasOverlaps}>
    {#if isSaving}
      <Spinner />
    {/if}
    Save Contract
  </Button>
</Dialog.Footer>
