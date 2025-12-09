<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
  import PopcornIcon from "@lucide/svelte/icons/popcorn";
</script>

<svelte:head>
  <title>Offices</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Test</div>
  {/snippet}
  <div class="p-4 space-y-2 bg-gree">
    <Alert.Root variant="warning">
      <CheckCircle2Icon />
      <Alert.Title>Success! Your changes have been saved</Alert.Title>
      <Alert.Description
        >This is an alert with icon, title and description.</Alert.Description
      >
    </Alert.Root>
    <Alert.Root variant="danger">
      <CheckCircle2Icon />
      <Alert.Title>Success! Your changes have been saved</Alert.Title>
      <Alert.Description
        >This is an alert with icon, title and description.</Alert.Description
      >
    </Alert.Root>
    <Alert.Root variant="success">
      <CheckCircle2Icon />
      <Alert.Title>Success! Your changes have been saved</Alert.Title>
      <Alert.Description
        >This is an alert with icon, title and description.</Alert.Description
      >
    </Alert.Root>
    <Alert.Root variant="info">
      <CheckCircle2Icon />
      <Alert.Title>Success! Your changes have been saved</Alert.Title>
      <Alert.Description
        >This is an alert with icon, title and description.</Alert.Description
      >
    </Alert.Root>
  </div>
</RouteContent>
