<script lang="ts">
  import LazyDialogContent, {
    type LazyContentType,
  } from "$lib/components/display/lazy-dialog-content.svelte";
  import { Root as DialogRoot } from "$lib/components/ui/dialog/index.js";
  import { delayComponentImport } from "$lib/utils";
  interface Props {
    open?: boolean;
  }
  let { open = $bindable(false) }: Props = $props();

  let TheContent: LazyContentType<typeof import("./content.svelte")> =
    $state(null);
</script>

<DialogRoot
  bind:open
  onOpenChangeComplete={async (isOpen) => {
    if (isOpen && !TheContent) {
      TheContent = await delayComponentImport(() => import("./content.svelte"));
    }
  }}
>
  <LazyDialogContent
    interactOutsideBehavior="ignore"
    class="h-[calc(100dvh_-_100px)] p-0 overflow-hidden sm:max-w-xl max-w-[576px] w-[576px]"
    trapFocus={false}
    ready={TheContent}
  >
    <TheContent />
  </LazyDialogContent>
</DialogRoot>
