<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { Spinner } from "$lib/components/ui/spinner/index.js";
  import { Save } from "@lucide/svelte";
  import { untrack } from "svelte";
  import BasicInformation from "./basic-information.svelte";
  import ContractFormFields from "./contract-form-fields.svelte";

  let isSaving = $state(false);
  let lname = $state("");
  let fname = $state("");
  let hasDuplicate = $state(false);
  let firstAndLastNameIsNotEmpty = $state({ value: false });

  let contractIsRequired = $state(false);
  $effect(() => {
    lname;
    fname;

    untrack(() => {
      firstAndLastNameIsNotEmpty.value =
        lname.trim() !== "" && fname.trim() !== "";
      contractIsRequired = lname.trim() !== "" && fname.trim() !== "";
    });
  });
</script>

<BasicInformation bind:contractIsRequired />

<ContractFormFields
  bind:required={contractIsRequired}
  activeContract
  width="w-full"
/>

<div class="mt-4 text-right pb-6">
  <Button type="submit" disabled={isSaving || hasDuplicate}>
    {#if isSaving}
      <Spinner />
      <span>Saving...</span>
    {:else}
      <Save />
      <span>Add Employee</span>
    {/if}
  </Button>
</div>
