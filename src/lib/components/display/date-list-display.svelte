<script
  lang="ts"
  generics="T extends { start_date: string; end_date: string  | null}"
>
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { type DateValue } from "@internationalized/date";
  import { CircleAlert } from "@lucide/svelte";
  import DateDisplay from "./date-display.svelte";

  type Props = {
    contracts: T[];
    startDateValue: DateValue | undefined;
    endDateValue: DateValue | undefined;
    sourceType?: ContractSourceType;
  };

  let { contracts, sourceType = "contract" }: Props = $props();
  let plural = $derived(contracts.length === 1 ? "" : "s");
  let errorSourceTypeMessage = $derived(
    sourceType === "pds" ? "employment period (PDS)" : sourceType,
  );
</script>

<div>
  <Alert.Root variant="danger" class="pr-0.5">
    <CircleAlert />
    <Alert.Title
      >Conflicting {errorSourceTypeMessage}{sourceType === "pds" ? "" : plural} found</Alert.Title
    >

    <Alert.Description>
      <div>
        These {errorSourceTypeMessage}{sourceType === "pds" ? "" : plural} overlap
        your selected dates
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
              <span class="pr-1 text-sm text-muted-foreground">&bullet;</span>
              <DateDisplay
                date={{ ...contract }}
                class="rounded-md w-max text-sm bg-background px-2 py-0.5"
                iconClass="size-4 "
              />
            </div>
          {/each}
        </div>
      </ScrollArea>
    </Alert.Description>
  </Alert.Root>
</div>
