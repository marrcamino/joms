<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/context.svelte";
  import type { Snippet } from "svelte";
  import { Trigger as SidebarTrigger } from "$lib/components/ui/sidebar/index.js";

  interface Props {
    header?: Snippet<[]>;
    noScrollArea?: boolean;
    /** This must be a valid CSS height value, e.g. `100vh`, `100dvh - 6.5rem`, etc. */
    contentHeight?: string;
    scrollAreaRef?: HTMLElement | null;
    children: Snippet;
  }

  let {
    header,
    noScrollArea,
    scrollAreaRef = $bindable(null),
    contentHeight = "100dvh - 3rem",
    children,
  }: Props = $props();

  const sidebar = useSidebar();
</script>

<header
  class="sticky top-0 z-[2] flex h-12 shrink-0 items-center border-b bg-background transition-[width,height] ease-linear print:hidden"
>
  <div class="ml-4 hidden max-md:block">
    <SidebarTrigger />
  </div>
  {#if header}
    <div
      class="px-2 flex flex-1 ml-2 items-center gap-2 print:hidden print:size-0 print:overflow-clip"
    >
      {@render header()}
    </div>
  {/if}
</header>

<div class="relative flex flex-1 flex-col gap-4" data-layout-content>
  <div class="flex-1">
    <!-- {@render children()} -->
    {#if noScrollArea}
      <div class="min-h-[calc(100vh-3rem)]">
        {@render children()}
      </div>
    {:else}
      <ScrollArea
        bind:ref={scrollAreaRef}
        style="height: calc({contentHeight});"
        orientation="both"
        scrollbarXClasses="[&_[data-scroll-area-thumb]]:bg-muted-foreground/60"
        scrollbarYClasses="[&_[data-scroll-area-thumb]]:bg-muted-foreground/60 z-[1]"
        class="relative transition-[width] duration-200 ease-linear w-dvw
        {sidebar.open
          ? 'md:w-[calc(100dvw_-_var(--sidebar-width))] print:w-full'
          : 'md:w-[calc(100dvw_-_var(--sidebar-width-icon))] print:w-full'}"
      >
        {@render children()}
      </ScrollArea>
    {/if}
  </div>
</div>
