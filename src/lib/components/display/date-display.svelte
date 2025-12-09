<script lang="ts" generics="T extends { start_date: string; end_date: string }">
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

<div class={cn("text-sm", className)}>
  <span>{formatDate(date.start_date)}</span>
  <ArrowRight
    class={cn(
      "inline size-3.5 text-muted-foreground -translate-y-0.5",
      iconClass
    )}
  />
  <span>{formatDate(date.end_date)}</span>
</div>
