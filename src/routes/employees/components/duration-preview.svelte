<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card/index.js";
  import { formatDate, nDate } from "$lib/utils";
  import { ArrowRight, CircleQuestionMark } from "@lucide/svelte";
  import NumberFlow from "@number-flow/svelte";
  import { getSideSheetContentContext } from "../context.svelte";

  const sheetContext = getSideSheetContentContext();
  let { years, months, days } = $derived(sheetContext.counts);

  let isDisable = $derived(sheetContext.contracts?.length === 0);
</script>

<div class="text-sm relative mr-auto inline">
  <div class="text-muted-foreground text-sm pl-1 leading-3.5">
    Length of Service
  </div>
  <HoverCard.Root openDelay={100} closeDelay={0} disabled={isDisable}>
    <HoverCard.Trigger
      aria-disabled={isDisable}
      class="group relative cursor-default w-max flex items-center hover:*:data-border:border-foreground"
    >
      <div
        data-border
        class="border-b w-[95%] group-aria-disabled:opacity-0 duration-300 transition-opacity translate-x-1 absolute border-muted-foreground/80 bottom-[1px] border-dashed"
      ></div>
      <div
        class="ml-1 w-full group-aria-disabled:text-muted-foreground transition-colors"
      >
        <NumberFlow value={years} suffix="y" />
        <NumberFlow value={months} suffix="m" />
        <NumberFlow value={days} suffix="d" />
      </div>
      <CircleQuestionMark
        class="inline size-3.5 group-aria-disabled:opacity-0 transition-opacity text-muted-foreground ml-1 duration-300"
      />
    </HoverCard.Trigger>
    <HoverCard.Content class="w-full">
      <div class="place-self-center">
        <div class="flex gap-2 items-center font-semibold text-sm text-nowrap">
          <span>{formatDate(sheetContext.los.startDate)}</span>
          <ArrowRight class="text-muted-foreground size-4" />
          <p>
            {formatDate(sheetContext.los.endDate)}

            <span class="text-muted-foreground font-normal">
              {#if sheetContext.los.endDate === nDate.getISOToday}
                &lpar;today&rpar;
              {:else}
                &lpar;ended&rpar;
              {/if}
            </span>
          </p>
        </div>
        {#if sheetContext.los.actualEndDate > nDate.getISOToday}
          <div class="text-sm text-muted-foreground">
            <span>Ends on </span>
            <span>{formatDate(sheetContext.los.actualEndDate)}</span>
          </div>
        {/if}
      </div>
    </HoverCard.Content>
  </HoverCard.Root>
</div>
