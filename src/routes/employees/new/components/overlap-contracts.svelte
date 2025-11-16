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
  }

  let { contracts }: Props = $props();
  let plural = $derived(contracts.length === 1 ? "" : "s");
</script>

<div>
  <Alert.Root class="text-yellow-600">
    <CircleAlert />
    <Alert.Title>Conflicting contract{plural} found</Alert.Title>

    <Alert.Description class="text-yellow-600/70  "
      >These contract{plural} overlap your selected dates.</Alert.Description
    >
  </Alert.Root>
  <ScrollArea
    style="height: 329.55px;"
    class="mt-2"
    type="always"
    orientation="vertical"
  >
    <div class="space-y-2">
      {#each contracts as contract (contract.contract_pk)}
        <div
          class="flex items-center gap-2 rounded-md w-max text-sm bg-muted px-2 py-0.5"
        >
          <div>{formatDate(contract.start_date)}</div>
          <ArrowRight class="text-muted-foreground size-4" />
          <div>{formatDate(contract.end_date)}</div>
        </div>
      {/each}
    </div>
  </ScrollArea>
</div>
