<script lang="ts" module>
  import ThemeSwitcher from "$lib/components/theme-switcher.svelte";
</script>

<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { ROUTES } from "$lib/routes";
  import type { ComponentProps } from "svelte";

  let currentURL = $state("");

  let {
    ref = $bindable(null),
    collapsible = "icon",
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header class="pl-1 pt-2.5">
    <Sidebar.Trigger
      class="cursor-e-resize text-muted-foreground ml-auto"
      title="open/close sidebar"
    />
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Main</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each ROUTES as route (route.url)}
            {#if "title" in route}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  isActive={currentURL === route.url.replace(/^\#/, "")}
                >
                  {#snippet tooltipContent()}
                    {route.title}
                  {/snippet}
                  {#snippet child({ props })}
                    <a
                      href={route.url}
                      {...props}
                      onclick={() =>
                        (currentURL = route.url.replace(/^\#/, ""))}
                    >
                      {#if "icon" in route}
                        <route.icon />
                      {/if}
                      <span>{route.title}</span>
                    </a>
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/if}
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Header>
    <ThemeSwitcher type="sidebar-button" />
  </Sidebar.Header>
</Sidebar.Root>
