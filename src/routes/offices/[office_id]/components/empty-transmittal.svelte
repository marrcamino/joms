<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { UserRound } from "@lucide/svelte";
  import { getDraftTransmittalContext } from "../../components/transmittal-dialog/context.svelte";

  const drftTransCtx = getDraftTransmittalContext();
</script>

<Empty.Root class="max-w-xl place-self-center w-full mt-4">
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
    <Empty.Title>No employees added yet</Empty.Title>
    <Empty.Description
      >Add at least one employee to save this transmittal</Empty.Description
    >
  </Empty.Header>
  <Empty.Content class="gap-1">
    <Button
      size="sm"
      type="button"
      onclick={() => {
        drftTransCtx.addEmpDialogState = true;
      }}
    >
      Add Employee
    </Button>
    <div class="text-muted-foreground">&ndash; or &ndash;</div>
    <Button
      size="sm"
      type="button"
      variant="ghost"
      onclick={() => {
        drftTransCtx.useTransDialogState = true;
      }}
    >
      Clone Transmittal
    </Button>
  </Empty.Content>
</Empty.Root>
