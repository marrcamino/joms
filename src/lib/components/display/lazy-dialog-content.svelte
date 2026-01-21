<script lang="ts" module>
  export type LazyContentType<T> = T extends { default: infer D }
    ? D | null
    : never;
</script>

<script lang="ts">
  import { Content } from "$lib/components/ui/dialog/index.js";
  import { Spinner } from "$lib/components/ui/spinner/index.js";
  import { cn } from "$lib/utils";
  import { type ClassValue } from "clsx";
  import { tick, untrack, type Snippet } from "svelte";
  import { fly, type TransitionConfig } from "svelte/transition";
  import type { Component, ComponentProps } from "svelte";
  // Define the mutually exclusive states
  type Props = {
    class?: ClassValue;
    ready: any;
  } & (
    | {
        child: Snippet<
          [{ class: string; flyIn: (node: Element) => TransitionConfig }]
        >;
        children?: never;
        onintroend?: never;
      }
    | {
        child?: never;
        children: Snippet; // Require children if child is not used
        onintroend?: () => void;
      }
  );

  type DialogContentProps = Omit<ComponentProps<typeof Content>, "children">;

  let {
    ready,
    child,
    children,
    onintroend,
    ...contentContentProps
  }: Props & DialogContentProps = $props();

  const GRID_CLASSES = "grid gap-4 w-full";

  const flyIn = (node: Element) => fly(node, { y: "40px", opacity: 0 });
</script>

<Content {...contentContentProps}>
  {#if child}
    {#if ready}
      {@render child({ class: GRID_CLASSES, flyIn })}
    {:else}
      {@render loading()}
    {/if}
  {:else if children}
    {#if ready}
      <div class={GRID_CLASSES} in:flyIn {onintroend}>
        {@render children()}
      </div>
    {:else}
      {@render loading()}
    {/if}
  {/if}
</Content>

{#snippet loading()}
  <div class="size-full flex h-[400px]">
    <Spinner class="m-auto" />
  </div>
{/snippet}
