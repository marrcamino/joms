<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import {
    type ButtonVariant,
    type ButtonSize,
    buttonVariants,
  } from "../button";
  import { cn } from "$lib/utils";

  let {
    ref = $bindable(null),
    class: className,
    variant = "secondary",
    size = "default",
    type = "button",
    ...restProps
  }: DialogPrimitive.CloseProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  } = $props();
</script>

<DialogPrimitive.Close
  bind:ref
  data-slot="dialog-close"
  {type}
  {...restProps}
  class={cn(className, buttonVariants({ variant, size }))}
/>
