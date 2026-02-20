<script lang="ts">
  import ProfileDialog from "$lib/components/profile-dialog/root.svelte";
  import RouteContent from "$lib/components/route-content.svelte";

  let open = $state(false)
</script>

<svelte:head>
  <title>Offices</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Test</div>
  {/snippet}
  <div class="p-4 space-y-2">
    <button class="border p-1 rounded" onclick={() => {open = true}}> Open</button>
    <ProfileDialog bind:open/>
  </div>
</RouteContent>
