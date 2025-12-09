<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { Trash2 } from "@lucide/svelte";
  import { getOfficeAllTransmittalContext } from "../../context.svelte";

  interface Props {
    transmittal: Transmittal;
  }

  let { transmittal }: Props = $props();

  const context = getOfficeAllTransmittalContext();
</script>

<ButtonGroup.Root class="place-self-center">
  <Button
    variant="outline"
    size="sm"
    onclick={() => {
      context.openDrawer(transmittal);
    }}>View</Button
  >

  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger
        class={buttonVariants({
          variant: "ghost-destructive",
          size: "icon-sm",
          class: "border border-accent",
        })}
        onclick={() => {
          context.openDeleteDialog(transmittal);
        }}
      >
        <Trash2 /></Tooltip.Trigger
      >
      <Tooltip.Content>
        <p>Delete Transmittal</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
</ButtonGroup.Root>
