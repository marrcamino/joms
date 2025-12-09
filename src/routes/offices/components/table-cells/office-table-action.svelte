<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { getOfficeContext } from "$routes/offices/context.svelte";
  import { ChevronDown, FilePlus2, Pencil, Trash2 } from "@lucide/svelte";

  interface Props {
    office: Office;
  }

  let { office }: Props = $props();

  const context = getOfficeContext();
</script>

<ButtonGroup.Root>
  <Button href={`#/offices/${office.office_pk}`} variant="outline" size="sm">
    View
  </Button>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      class={buttonVariants({ variant: "outline", size: "icon-sm" })}
    >
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
            context.transmittalPageState = true;
          }}
        >
          <FilePlus2 />
          <span>Add Transmittal</span>
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</ButtonGroup.Root>
