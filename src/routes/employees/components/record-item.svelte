<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button";
  import * as Item from "$lib/components/ui/item/index.js";
  import { formatDate } from "$lib/utils";
  import { getOfficeContext } from "$routes/offices/context.svelte";
  import {
    ArrowRight,
    Bookmark,
    Building,
    ChevronDown,
    PhilippinePeso,
    Tag,
  } from "@lucide/svelte";
  import { quadInOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";
  import ContractCardActions from "./contract-card-actions.svelte";
  import DateDisplay from "$lib/components/display/date-display.svelte";

  interface Props {
    contract: Contract;
  }

  let { contract }: Props = $props();
  const officeContext = getOfficeContext();
  const icons = {
    peso: PhilippinePeso,
    tag: Tag,
    building: Building,
    bookmark: Bookmark,
  };

  type IconKey = keyof typeof icons;

  let collapse = $state(false);
  let isCollapse = $derived(collapse ? "" : null);
  let office = $derived(
    contract.office_fk
      ? (officeContext.getOffice(contract.office_fk) ?? undefined)
      : undefined
  );

  let divHeight = $state(0);
  let isLong = $derived(divHeight > 25 ? "" : null);
</script>

<Item.Root variant="muted">
  <Item.Content class="gap-0">
    <Item.Title class="w-full">
      <DateDisplay date={contract} />

      {#if contract.is_active}
        <Badge variant="outline-constructive">Active</Badge>
      {/if}

      {#if contract.source_type !== "transmittal"}
        <ContractCardActions {contract} />
      {/if}
    </Item.Title>
    <Item.Description
      data-collapse={isCollapse}
      class="group text-wrap line-clamp-none relative pb-5"
    >
      <div class="min-h-0 line-clamp-2 absolute w-full top-0">
        {#if !collapse}
          <div out:fade={{ delay: 300 }} bind:clientHeight={divHeight}>
            {contract.designation}
          </div>
        {/if}
      </div>
      <div data-long={isLong} class="min-h-[16px] data-[long]:min-h-[42px]">
        {#if collapse}
          <div transition:slide={{ easing: quadInOut, duration: 280 }}>
            <div in:fade={{ delay: 200 }}>
              <div>
                {contract.designation}
              </div>

              <div class="pt-2">
                {@render row("Rate", `${contract.rate}/Month`, "peso")}
                {@render row("Category", "Technical Staff", "tag")}
                {@render row("Office", office?.office_title, "building")}
                {@render row("Remarks", contract.remarks || "None", "bookmark")}
              </div>
            </div>
          </div>
        {/if}
      </div>
      <Button
        title="collapse"
        type="button"
        variant="ghost"
        class="!px-1 -bottom-2.5 absolute left-1/2 -translate-x-1/2 h-5 rounded-sm"
        onclick={() => {
          collapse = !collapse;
        }}
      >
        <ChevronDown
          data-collapse={isCollapse}
          class="transform-gpu transition-transform duration-300 group-data-[collapse]:rotate-x-180"
        />
      </Button>

      <Badge
        data-type={contract.source_type}
        variant="secondary"
        class="capitalize absolute data-[type='pds']:uppercase -bottom-2.5 -right-2 px-1.5 rounded-sm text-muted-foreground"
        >{contract.source_type}</Badge
      >
    </Item.Description>
  </Item.Content>
</Item.Root>

{#snippet row(title: string, value: undefined | string, iconKey: IconKey)}
  {@const Icon = icons[iconKey]}
  <div class="grid grid-cols-[16px_1fr] gap-2 pt-1">
    <Icon class="size-3.5 translate-y-1" />
    <span>
      <span class="font-semibold text-foreground">{title}:</span>
      {value}
    </span>
  </div>
{/snippet}
