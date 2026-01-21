<script lang="ts">
  import DateDisplay from "$lib/components/display/date-display.svelte";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button";
  import * as Item from "$lib/components/ui/item/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { APPOINTMENT_STATUS_MAP } from "$lib/constants";
  import { getPositionCategoryStoreContext } from "$lib/context/appointment-categ-store.svelte";
  import { getOfficeContext } from "$routes/offices/context.svelte";
  import {
    Bookmark,
    Building,
    ChevronDown,
    PhilippinePeso,
    Tag,
    UserCog,
  } from "@lucide/svelte";
  import { untrack } from "svelte";
  import { quadInOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";
  import ContractCardActions from "./record-item-actions.svelte";

  interface Props {
    contract: Contract;
  }

  let { contract }: Props = $props();

  const officeContext = getOfficeContext();
  const categStore = getPositionCategoryStoreContext();
  const icons = {
    peso: PhilippinePeso,
    tag: Tag,
    building: Building,
    bookmark: Bookmark,
    user: UserCog,
  };

  type IconKey = keyof typeof icons;

  let collapse = $state(false);
  let isCollapse = $derived(collapse ? "" : null);
  let officeTitle = $derived.by(() => {
    if (!contract.office_fk) return null;
    return officeContext.getOffice(contract.office_fk)?.office_title ?? null;
  });

  let category: undefined | null | string = $state(undefined);

  $effect(() => {
    contract;

    untrack(async () => {
      if (!contract.position_category_fk) {
        category = null;
        return;
      }
      const theCateg = await categStore.getCategory(
        contract.position_category_fk,
      );
      category = theCateg ? theCateg.post_categ_name : null;
    });
  });

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

      <ContractCardActions {contract} />
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
                {@render row(
                  "Status",
                  APPOINTMENT_STATUS_MAP[contract.appointment_status],
                  "user",
                )}
                {@render row("Rate", contract.rate, "peso", "/Month")}
                {@render row("Category", category, "tag")}
                {@render row("Office", officeTitle, "building")}
                {@render row("Remarks", contract.remarks, "bookmark")}
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

{#snippet row(title: string, value: any, iconKey: IconKey, post?: string)}
  {@const Icon = icons[iconKey]}
  <div class="grid grid-cols-[16px_1fr] gap-2 pt-1">
    <Icon class="size-3.5 translate-y-1" />
    <p class="flex items-start gap-1">
      <span class="font-semibold text-foreground">{title}:</span>

      {#if typeof value === "undefined"}
        <Skeleton class="h-4 w-[50px] rounded-sm translate-y-0.5" />
      {:else}
        <span
          data-empty={!value ? "" : null}
          class="data-empty:text-yellow-600"
        >
          {value ? `${value + (post ?? "")}` : "—"}
        </span>
      {/if}
    </p>
  </div>
{/snippet}
