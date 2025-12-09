<script lang="ts">
  import type { HTMLTableAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils";

  let {
    ref = $bindable(null),
    class: className,
    children,
    noWrapper,
    wrapperClass,
    ...restProps
  }: WithElementRef<HTMLTableAttributes> & {
    noWrapper?: boolean;
    wrapperClass?: string;
  } = $props();
</script>

{#if noWrapper}
  <table
    bind:this={ref}
    data-slot="table"
    class={cn("w-full caption-bottom text-sm", className)}
    {...restProps}
  >
    {@render children?.()}
  </table>
{:else}
  <div
    data-slot="table-container"
    class={cn(wrapperClass, "relative w-full overflow-x-auto")}
  >
    <table
      bind:this={ref}
      data-slot="table"
      class={cn("w-full caption-bottom text-sm", className)}
      {...restProps}
    >
      {@render children?.()}
    </table>
  </div>
{/if}
