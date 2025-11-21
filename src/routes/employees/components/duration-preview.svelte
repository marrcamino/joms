<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card/index.js";
  import { formatDate, nDate } from "$lib/utils";
  import { ArrowRight, CircleQuestionMark } from "@lucide/svelte";
  import NumberFlow from "@number-flow/svelte";
  import { getSideSheetContentContext } from "../context.svelte";

  const sheetContext = getSideSheetContentContext();
  let { years, months, days } = $derived(sheetContext.counts);
</script>

<div class="text-sm relative mr-auto inline">
  <div class="text-muted-foreground text-sm pl-1 leading-3.5">
    Length of Service
  </div>
  <HoverCard.Root openDelay={0} closeDelay={0}>
    <HoverCard.Trigger
      class="relative cursor-pointer w-max flex items-center hover:*:data-border:border-foreground"
    >
      <div
        data-border
        class="border-b w-[95%] translate-x-1 absolute border-muted-foreground/80 bottom-0.5 border-dashed"
      ></div>
      <div class="ml-1 w-full">
        <NumberFlow value={years} suffix={years > 1 ? "yrs" : "yr"} />
        <NumberFlow value={months} suffix={months > 1 ? "mos" : "mo"} />
        <NumberFlow value={days} suffix={days > 1 ? "days" : "day"} />
      </div>
      <CircleQuestionMark class="inline size-3  text-muted-foreground ml-1" />
    </HoverCard.Trigger>
    <HoverCard.Content class="w-full">
      <div class="place-self-center">
        <div class="flex gap-2 items-center font-semibold text-sm text-nowrap">
          <span>{formatDate(sheetContext.los.startDate)}</span>
          <ArrowRight class="text-muted-foreground size-4" />
          <p>
            {formatDate(sheetContext.los.endDate)}
            {#if sheetContext.los.endDate === nDate.getISOToday}
              <span class="text-muted-foreground">&lpar;Today&rpar;</span>
            {:else}
              <span class="text-muted-foreground">&lpar;Ended&rpar;</span>
            {/if}
          </p>
        </div>
        {#if sheetContext.los.actualEndDate > nDate.getISOToday}
          <div class="text-sm text-muted-foreground">
            <span>End by </span>
            <span>{formatDate(sheetContext.los.actualEndDate)}</span>
          </div>
        {/if}
      </div>
    </HoverCard.Content>
  </HoverCard.Root>
</div>
