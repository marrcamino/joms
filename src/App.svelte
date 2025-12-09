<script lang="ts">
  import AppSidebar from "$lib/components/sidebar/app-sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { ROUTES } from "$lib/routes";
  import { setEmployeeContext } from "$routes/employees/context.svelte";
  import { setOfficeContext } from "$routes/offices/context.svelte";
  import { ModeWatcher } from "mode-watcher";
  import { onMount } from "svelte";
  import Router from "svelte-spa-router";

  const routes = Object.fromEntries(
    ROUTES.map((route) => [
      route.url !== "*" ? route.url.slice(1) : route.url,
      route.page,
    ])
  );

  const employeeContext = setEmployeeContext();
  const officeContext = setOfficeContext();

  onMount(async () => {
    await officeContext.loadTableData();
    await employeeContext.initData();
  });
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <Router {routes} />
  </Sidebar.Inset>
</Sidebar.Provider>

<ModeWatcher defaultMode={"system"} />
<Toaster richColors position="top-left" />
