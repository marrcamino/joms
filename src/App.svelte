<script lang="ts">
  import AppSidebar from "$lib/components/sidebar/app-sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { ROUTES } from "$lib/routes";
  import { ModeWatcher } from "mode-watcher";
  import Router from "svelte-spa-router";

  const routes = Object.fromEntries(
    ROUTES.map((route) => [route.url.slice(1), route.page])
  );
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <Router {routes} useHash={false} />
  </Sidebar.Inset>
</Sidebar.Provider>

<ModeWatcher defaultMode={"system"} />
<Toaster richColors position="top-left" />
