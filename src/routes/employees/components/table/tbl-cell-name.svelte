<script lang="ts">
  import { formatFullName } from "$lib/utils";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";

  interface Props {
    lastname: string;
    firstname: string;
    middlename: string | null;
    extension: string | null;
  }

  let { lastname, firstname, middlename, extension }: Props = $props();

  const fullname = $derived(
    formatFullName({
      lastname,
      firstname,
      middlename,
      extension,
    })
  );
</script>

<div>
  <span> {fullname}</span>

  <!-- <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <div class="relative inline-flex size-2.5 ml-1">
          {@render warning()}
          {@render warning(true)}
        </div></Tooltip.Trigger
      >
      <Tooltip.Content side="right">
        <p>Add to library</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider> -->
</div>

{#snippet warning(absolute = false)}
  <div
    data-absolute={absolute ? "" : null}
    class="size-full data-[absolute]:inset-0 rounded-full bg-yellow-600 data-[absolute]:animate-ping data-[absolute]:absolute"
  ></div>
{/snippet}
