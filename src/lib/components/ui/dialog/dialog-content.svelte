<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";
  import * as Dialog from "./index.js";
  import { cn, type WithoutChildrenOrChild } from "$lib/utils";

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    children,
    showCloseButton = true,
    disableCloseButton = false,
    ...restProps
  }: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
    portalProps?: DialogPrimitive.PortalProps;
    children: Snippet;
    showCloseButton?: boolean;
    disableCloseButton?: boolean;
  } = $props();
</script>

<Dialog.Portal {...portalProps}>
  <Dialog.Overlay
    class="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-y-auto py-14 grid place-items-center"
  >
    <DialogPrimitive.Content
      bind:ref
      data-slot="dialog-content"
      class={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg relative",
        className
      )}
      {...restProps}
    >
      {@render children?.()}
      {#if showCloseButton}
        <DialogPrimitive.Close
          class="ring-offset-background focus:ring-ring rounded-xs focus:outline-hidden absolute end-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
          disabled={disableCloseButton}
        >
          <XIcon />
          <span class="sr-only">Close</span>
        </DialogPrimitive.Close>
      {/if}
    </DialogPrimitive.Content>
  </Dialog.Overlay>
</Dialog.Portal>
