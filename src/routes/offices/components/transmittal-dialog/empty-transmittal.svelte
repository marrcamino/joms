<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { UserRound } from "@lucide/svelte";
  import { getTransmittalContext } from "./context.svelte";

  const context = getTransmittalContext();
</script>

<Empty.Root class="border border-dashed max-w-xl place-self-center w-full mt-4">
  <Empty.Header>
    <Empty.Media>
      <div class="*:ring-background flex -space-x-2 *:size-12 *:ring-2">
        {#each Array.from({ length: 3 }) as _}
          <div class="rounded-full flex items-center justify-center bg-muted">
            <UserRound />
          </div>
        {/each}
      </div>
    </Empty.Media>
    <Empty.Title>No Employees Added Yet</Empty.Title>
    <Empty.Description
      >Add at least one employee to save transmittal</Empty.Description
    >
  </Empty.Header>
  <Empty.Content class="gap-2">
    <Button
      size="sm"
      type="button"
      onclick={() => {
        context.secondDialogState = true;
      }}
    >
      Add Employee
    </Button>
    <Button size="sm" type="button" variant="secondary">
      Reuse Last Transmittal
    </Button>
  </Empty.Content>
</Empty.Root>
