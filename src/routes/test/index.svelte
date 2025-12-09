<script lang="ts">
  import DateDisplay from "$lib/components/display/date-display.svelte";
  import RouteContent from "$lib/components/route-content.svelte";
  DateDisplay;
</script>

<svelte:head>
  <title>Offices</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Test</div>
  {/snippet}
  <div class="p-4 space-y-2">
    <DateDisplay date={{ start_date: "2025/10/01", end_date: "2025/12/31" }} />
  </div>
</RouteContent>
