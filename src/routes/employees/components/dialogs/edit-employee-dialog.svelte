<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { apiFetch, normalizeFormData } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import { getEmployeeContext } from "../../context.svelte";
  import BasicInformation, {
    type BasicInformationObjectFormData,
  } from "../../new/components/basic-information.svelte";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let isUpdating = $state(false);
  let hasDuplicate = $state(false);

  const context = getEmployeeContext();

  async function onsubmit(e: SubmitEvent) {
    try {
      isUpdating = true;

      e.preventDefault();
      const formData = normalizeFormData(
        e.target as HTMLFormElement
      ) as BasicInformationObjectFormData;

      if (!context.openEmployee) return;

      const employee_pk = context.openEmployee.employee_pk;

      const res = await apiFetch(
        `/api/employee/update?employee_pk=${employee_pk}`,
        {
          method: "PATCH",
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        toast.error("An error while updating employee", {
          description: "Please try again",
        });
        return;
      }
      const updated = context.updateEmpBasicInfo({
        employee_pk,
        firstname: formData.fname,
        lastname: formData.lname,
        middlename: formData.mname,
        ...formData,
      });
      context.openEmployee = updated;
      toast.success("Employee updated successfully");
      open = false;
    } finally {
      isUpdating = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="sm:max-w-[450px] px-0"
    escapeKeydownBehavior={isUpdating ? "ignore" : "close"}
    interactOutsideBehavior={isUpdating ? "ignore" : "close"}
    disableCloseButton={isUpdating}
  >
    <form {onsubmit} class="grid gap-0 w-full" autocomplete="off">
      <Dialog.Header class="px-6">
        <Dialog.Title>Edit Employee</Dialog.Title>
        <Dialog.Description>
          Fields marked with asterisk &lpar;<span class="text-destructive"
            >*</span
          >&rpar; are required.
        </Dialog.Description>
      </Dialog.Header>

      <div class="px-6 pb-4">
        <BasicInformation
          asContent
          employee={context.openEmployee}
          bind:hasDuplicate
        />
      </div>
      <Dialog.Footer class="px-6 pt-4">
        <Dialog.Close
          disabled={isUpdating}
          type="button"
          class={buttonVariants({ variant: "secondary" })}>Cancel</Dialog.Close
        >
        <Button type="submit" disabled={isUpdating || hasDuplicate}>
          {#if isUpdating}
            <Spinner />
          {/if}
          <span>Save changes</span>
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
