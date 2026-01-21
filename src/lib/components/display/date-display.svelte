<script
  lang="ts"
  generics="T extends { start_date: string; end_date: string | null }"
>
  import { cn, formatDate } from "$lib/utils";
  import { ArrowRight } from "@lucide/svelte";
  import type { ClassValue } from "svelte/elements";

  type Props = {
    date: T;
    class?: ClassValue | null;
    iconClass?: ClassValue | null;
  };

  let { date, class: className, iconClass }: Props = $props();
</script>

<div class={cn("text-sm flex items-center gap-1", className)}>
  <span>{formatDate(date.start_date)}</span>
  <ArrowRight class={cn("inline size-4 text-muted-foreground", iconClass)} />

  <span
    data-present={!date.end_date ? "" : null}
    class="data-present:text-yellow-600"
  >
    {#if date.end_date}
      {formatDate(date.end_date)}
    {:else}
      PRESENT
    {/if}
  </span>
</div>
