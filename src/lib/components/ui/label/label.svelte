<script lang="ts">
  import { Label as LabelPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: LabelPrimitive.RootProps = $props();
</script>

<LabelPrimitive.Root
  bind:ref
  data-slot="label"
  class={cn(
    "flex select-none items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
    className
  )}
  {...restProps}
>
  {@render children?.()}
  {#if restProps["aria-required"]}
    <span class="text-destructive -translate-x-1.5">*</span>
  {/if}
</LabelPrimitive.Root>
