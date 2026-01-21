<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
</script>

<svelte:head>
  <title>Offices</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Test</div>
  {/snippet}
  <div class="p-4 space-y-2">
    <button class="border p-1 rounded" onclick={() => {}}> Open</button>

  </div>
</RouteContent>
