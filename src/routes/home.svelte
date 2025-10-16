<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    Dashbaord
  {/snippet}
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis voluptatum quam
  voluptatem quo eius laboriosam obcaecati quos aliquid quisquam, deserunt accusantium
  officiis dignissimos ipsum earum ex, voluptatibus beatae exercitationem veritatis!
</RouteContent>
