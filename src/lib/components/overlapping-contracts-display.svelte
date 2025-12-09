<script lang="ts">
  import { formatDate } from "$lib/utils";
  import { type DateValue } from "@internationalized/date";
  import { ArrowRight, CircleAlert } from "@lucide/svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import * as Alert from "$lib/components/ui/alert/index.js";

  interface Props {
    contracts: Contract[];
    startDateValue: DateValue | undefined;
    endDateValue: DateValue | undefined;
    sourceType?: Exclude<ContractSourceType, "pds">;
  }

  let { contracts, sourceType = "contract" }: Props = $props();
  let plural = $derived(contracts.length === 1 ? "" : "s");
</script>

<div>
  <Alert.Root variant="danger" class="pr-0.5">
    <CircleAlert />
    <Alert.Title>Conflicting {sourceType}{plural} found</Alert.Title>

    <Alert.Description>
      <div>
        These {sourceType}{plural} overlap your selected dates
      </div>
      <ScrollArea
        class="mt-2 pb-2 text-foreground w-full"
        type="always"
        orientation="vertical"
        viewPortClasses="h-full max-h-[329.55px] w-full"
      >
        <div class="space-y-1">
          {#each contracts as contract (contract.contract_pk)}
            <div class="flex items-center">
              <span class="pr-1 text-sm text-muted-foreground">&bullet;</span>
              <div
                class="flex items-center gap-2 rounded-md w-max text-sm bg-background px-2 py-0.5"
              >
                <div>{formatDate(contract.start_date)}</div>
                <ArrowRight class="text-muted-foreground size-4" />
                <div>{formatDate(contract.end_date)}</div>
              </div>
            </div>
          {/each}
        </div>
      </ScrollArea>
    </Alert.Description>
  </Alert.Root>
</div>
