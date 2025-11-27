<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { ChevronDown, UserPen } from "@lucide/svelte";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
  } from "../context.svelte";

  interface Props {
    employee: Employee;
  }

  let { employee }: Props = $props();
  const context = getEmployeeContext();
  const sheetContext = getSideSheetContentContext();

  type StateKey =
    | "sheetOpenState"
    | "editEmployeeState"
    | "deleteEmployeeAlertDialogState";

  function openSheetOrDialog(state: StateKey = "sheetOpenState") {
    context.openEmployee = employee;
    if (state === "sheetOpenState") context.sheetOpenState = true;
    else sheetContext[state] = true;
  }
</script>

<div class="place-self-center">
  <ButtonGroup.Root>
    <ButtonGroup.Root>
      <Button onclick={() => openSheetOrDialog()} size="sm" variant="outline"
        >View</Button
      >
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              aria-label="More Options"
              class="!px-1.5 h-8"
            >
              <ChevronDown />
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-[150px]">
          <DropdownMenu.Group>
            <DropdownMenu.Label>Manage Employee</DropdownMenu.Label>
            <DropdownMenu.Item
              onclick={() => openSheetOrDialog("editEmployeeState")}
            >
              <UserPen />
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              variant="destructive"
              onclick={() =>
                openSheetOrDialog("deleteEmployeeAlertDialogState")}
            >
              <Trash2 />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </ButtonGroup.Root>
  </ButtonGroup.Root>
</div>
