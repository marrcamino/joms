<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<div class="fixed z-50 inset-0 w-screen h-screen bg-background grid">
  <Card.Root class="w-xl text-center place-self-center py-8">
    <Card.Header class="gap-0">
      <p class="text-base font-semibold text-muted-foreground">404</p>
      <h1
        class="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl"
      >
        Page not found
      </h1>
    </Card.Header>

    <Card.Content>
      <div class="text-center">
        <p class="text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
      </div>
    </Card.Content>

    <Card.Footer class="flex justify-center gap-2">
      <Button href="/">Go to Home</Button>

      <Button variant="secondary" onclick={() => history.back()}>Back</Button>
    </Card.Footer>
  </Card.Root>
</div>
