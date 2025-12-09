<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
  import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
  import {
    cn,
    type WithoutChild,
    type WithoutChildrenOrChild,
  } from "$lib/utils";

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    mode = "default",
    ...restProps
  }: WithoutChild<AlertDialogPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<AlertDialogPrimitive.PortalProps>;
    mode?: "danger" | "default";
  } = $props();

  const modes = {
    default: "",
    danger:
      "**:data-[slot=alert-dialog-title]:text-red-200 border-destructive bg-destructive/20 **:data-[slot=alert-dialog-description]:text-red-200/80 ",
  };
</script>

<AlertDialogPrimitive.Portal {...portalProps}>
  <AlertDialogOverlay />
  <AlertDialogPrimitive.Content
    bind:ref
    data-slot="alert-dialog-content"
    class={cn(
      "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
      modes[mode],
      className
    )}
    {...restProps}
  />
</AlertDialogPrimitive.Portal>
