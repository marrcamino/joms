<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { ChevronLeft } from "@lucide/svelte";
  import BasicInformation from "./components/basic-information.svelte";
</script>

<svelte:head>
  <title>New Employee</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Add New Employee</div>
    <Button class="ml-auto" size="sm" onclick={() => window.history.back()}>
      <ChevronLeft />
      <span>Go Back</span>
    </Button>
  {/snippet}
  <form class="max-w-md mx-auto mt-4" autocomplete="off">
    <BasicInformation />
  </form>
</RouteContent>
