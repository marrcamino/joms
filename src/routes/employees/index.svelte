<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { UserRoundPlus } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index";
</script>

<svelte:head>
  <title>Employees</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Employees</div>

    <Button class="ml-auto" size="sm" href="#/employees/new">
      <UserRoundPlus />
      <span>New Employee</span>
    </Button>
  {/snippet}
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis voluptatum quam
  voluptatem quo eius laboriosam obcaecati quos aliquid quisquam, deserunt accusantium
  officiis dignissimos ipsum earum ex, voluptatibus beatae exercitationem veritatis!
</RouteContent>
