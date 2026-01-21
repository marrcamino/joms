<script
  lang="ts"
  generics="T extends { start_date: string; end_date: string  | null}"
>
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { formatDate } from "$lib/utils";
  import { CircleAlert } from "@lucide/svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import DateDisplay from "$lib/components/display/date-display.svelte";

  type Props = {
    startDate: string;
    isBackdating: boolean;
    contracts: T[];
  };

  let { startDate, isBackdating, contracts }: Props = $props();
</script>

<div>
  <Alert.Root variant="danger" class="pr-0.5">
    <CircleAlert />
    <Alert.Title>
      {isBackdating ? "Start Date Conflict" : "Existing PRESENT PDS record"}
    </Alert.Title>

    <Alert.Description class="inline">
      {#if isBackdating}
        The selected start date falls within a previous contract period. You
        cannot create a present-ended contract that starts in the past.

        {#if contracts.length}
          <div class="mt-4">
            <div>
              Following {contracts.length === 1 ? "is an" : "are"} overlapping PDS
              {contracts.length === 1 ? "Record" : "Records"}
            </div>
            <ScrollArea
              class="mt-2 pb-2 text-foreground w-full"
              type="always"
              orientation="vertical"
              viewPortClasses="max-h-[330px]"
            >
              <div class="space-y-1">
                {#each contracts as contract}
                  <div class="flex items-center">
                    <span class="pr-1 text-sm text-muted-foreground"
                      >&bullet;</span
                    >
                    <DateDisplay
                      date={{ ...contract }}
                      class="rounded-md w-max text-sm bg-background px-2 py-0.5"
                      iconClass="size-4 "
                    />
                  </div>
                {/each}
              </div>
            </ScrollArea>
          </div>
        {/if}
      {:else}
        An ongoing PDS period exists starting on <b
          >{startDate ? formatDate(startDate) : "--- --, ----"}</b
        >. Only one ongoing &lpar;<b>Present</b>&rpar; period is allowed per
        employee.
      {/if}
    </Alert.Description>
  </Alert.Root>
</div>
