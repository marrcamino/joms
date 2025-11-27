<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { apiFetch } from "$lib/utils";
  import { toast } from "svelte-sonner";
  import { getEmployeeContext } from "../context.svelte";

  interface Props {
    open?: boolean;
    afterDelete?: (id: number) => void;
  }

  let { open = $bindable(false), afterDelete }: Props = $props();
  const context = getEmployeeContext();

  let isDeleting = $state(false);

  async function onclick() {
    const id = context.openEmployee?.employee_pk;
    if (!id) return;

    try {
      isDeleting = true;
      const res = await apiFetch(`/api/employee?employee_pk=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("An error while deleting employee", {
          description: "Please try again",
        });

        return;
      }
      context.openEmployee = null;
      context.remove(id);
      open = false;
      afterDelete?.(id);
      isDeleting = false;
      toast.success("Employee deleted succesfully");
    } finally {
      isDeleting = false;
    }
  }
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content
    interactOutsideBehavior={isDeleting ? "ignore" : "close"}
    escapeKeydownBehavior={isDeleting ? "ignore" : "close"}
  >
    <AlertDialog.Header>
      <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
      <AlertDialog.Description>
        This action is permanent and cannot be undone. Deleting this employee
        will also remove all related records from the database.
      </AlertDialog.Description>
    </AlertDialog.Header>

    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isDeleting}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        disabled={isDeleting}
        {onclick}
        class={buttonVariants({ variant: "destructive" })}
      >
        {#if isDeleting}
          <Spinner />
        {/if}
        <span>Delete</span>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
