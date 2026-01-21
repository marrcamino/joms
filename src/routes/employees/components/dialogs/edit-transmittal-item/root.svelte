<script lang="ts">
  import LazyDialogContent, {
    type LazyContentType,
  } from "$lib/components/display/lazy-dialog-content.svelte";
  import { Root } from "$lib/components/ui/dialog/index.js";
  import { delayComponentImport, focusElement } from "$lib/utils";
  import { getSideSheetContentContext } from "$routes/employees/context.svelte";

  const sheetContext = getSideSheetContentContext();
  /**
   * Declared here to ensure proper cleanup when the dialog closes,
   * preventing UI flicker.
   */
  let redirectLink = $state("");

  let TheContent: LazyContentType<typeof import("./content.svelte")> =
    $state(null);
</script>

<Root
  bind:open={sheetContext.editTransItemDialogState}
  onOpenChangeComplete={async (isOpen) => {
    if (!isOpen) {
      redirectLink = "";
      sheetContext.selectedContract = null;
    }
    if (!TheContent) {
      TheContent = await delayComponentImport(() => import("./content.svelte"));
    }
  }}
>
  <LazyDialogContent class="w-[480px]" ready={TheContent}>
    {#snippet child({ class: className, flyIn })}
      <form
        autocomplete="off"
        class={className}
        in:flyIn
        onintroend={() =>
          focusElement("#designation", `#editTransmittalEntryForm`)}
        id="editTransmittalEntryForm"
      >
        <TheContent bind:redirectLink />
      </form>
    {/snippet}
  </LazyDialogContent>
</Root>
