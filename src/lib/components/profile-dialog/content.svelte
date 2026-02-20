<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { PersonStanding, User } from "@lucide/svelte";
  import OtherInfo from "./views/other-info.svelte";
  import PersonalInfo from "./views/personal-info.svelte";

  import type { Component } from "svelte";

  type ViewName = (typeof views)[number]["name"];
  const views = [
    { name: "Personal Info", icon: User },
    { name: "Other Info", icon: PersonStanding },
  ] as const;

  const viewsContent: Record<ViewName, Component<any>> = {
    "Personal Info": PersonalInfo,
    "Other Info": OtherInfo,
  };

  let activeView: ViewName = $state("Personal Info");
  let ActiveViewComponent = $derived(viewsContent[activeView]);
</script>

<Dialog.Title class="sr-only">Settings</Dialog.Title>
<Dialog.Description class="sr-only"
  >Customize your settings here.</Dialog.Description
>
<Sidebar.Provider class="items-start w-[580px]" style="--sidebar-width: 10rem">
  <Sidebar.Root collapsible="none" class="h-[calc(100dvh_-_102px)] border-r">
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#each views as view (view.name)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  isActive={view.name === activeView}
                  onclick={() => {
                    activeView = view.name;
                  }}
                >
                  <view.icon />
                  <span>{view.name}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  </Sidebar.Root>
  <main class="flex h-[calc(100dvh_-_102px)] flex-col shrink-0 min-w-[414px]">
    <header
      class="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
    >
      <div class="px-4 font-semibold text-muted-foreground">
        {activeView.replace("Info", "Information")}
      </div>
    </header>
    <div
      class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 max-w-[414px]"
    >
      <!-- {@const sss = ''} -->
      <ActiveViewComponent />
    </div>
  </main>
</Sidebar.Provider>
