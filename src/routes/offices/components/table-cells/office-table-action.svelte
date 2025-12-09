<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { getOfficeContext } from "$routes/offices/context.svelte";
  import { ChevronDown, Pencil, Trash2, FilePlus2 } from "@lucide/svelte";

  interface Props {
    office: Office;
  }

  let { office }: Props = $props();

  const context = getOfficeContext();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({ variant: "outline", class: "!px-2.5 h-8" })}
  >
    <span>Action</span>
    <ChevronDown />
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Group>
      <DropdownMenu.Item onclick={() => context.openOfficeDialog(office)}>
        <Pencil />
        <span>Edit</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item
        variant="destructive"
        onclick={() => context.openDeleteDialog(office)}
      >
        <Trash2 />
        <span>Delete</span>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Item
        onclick={() => {
          context.openOffice = office;
          context.transmittalDialogState = true;
        }}
      >
        <FilePlus2 />
        <span>Add Transmittal</span>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
