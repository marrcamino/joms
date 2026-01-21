<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import { ExternalLink } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  interface Props {
    children: Snippet;
    noIcon?: boolean;
    href: string;
  }
  let {
    children,
    href,
    noIcon,
    ...restProps
  }: Props & Exclude<HTMLAnchorAttributes, "href"> = $props();
</script>

<a
  {href}
  {...restProps}
  class={cn(
    "underline hover:opacity-70 decoration-dotted underline-offset-2",
    restProps.class,
  )}
>
  {@render children()}
  {#if !noIcon}
    <ExternalLink class="inline size-3 align-middle relative bottom-[1px]" />
  {/if}
</a>
