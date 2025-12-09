<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import type { TransmittalContractItems } from "$lib/types";
  import { getDraftTransmittalContext } from "$routes/offices/components/transmittal-dialog/context.svelte";
  import { Pencil, Trash2 } from "@lucide/svelte";
  import { getOfficeTransmittalContext } from "./context.svelte";

  interface Props {
    item: TransmittalContractItems;
  }

  let { item }: Props = $props();

  const openTransCtx = getOfficeTransmittalContext();
  const draftTransCtx = getDraftTransmittalContext();
</script>

<div
  class="p-2 border-none group-data group-hover/row:opacity-100 opacity-0 group-data-[right]:opacity-100 group-data-[right]:bg-transparent bg-background"
>
  <ButtonGroup.Root class="place-self-center">
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger
          class={buttonVariants({
            variant: "outline",
            size: "icon-sm",
          })}
          onclick={() => {
            draftTransCtx.noOverlapCheck = true;
            draftTransCtx.empTranToEdit =
              draftTransCtx.convertToValidEmpTrans(item);
            draftTransCtx.addEmpDialogState = true;
          }}
        >
          <Pencil />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Edit</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>

    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger
          class={buttonVariants({
            variant: "ghost-destructive",
            size: "icon-sm",
            class: "border border-accent",
          })}
          onclick={() => {
            openTransCtx.openDeleteDialog(item);
          }}
        >
          <Trash2 />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Remove</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  </ButtonGroup.Root>
</div>
