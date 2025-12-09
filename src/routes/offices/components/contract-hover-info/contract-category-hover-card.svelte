<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import * as HoverCard from "$lib/components/ui/hover-card/index.js";
  import { apiFetch, formatDate } from "$lib/utils";
  import { ArrowRight } from "@lucide/svelte";

  interface Props {
    contract: Contract;
  }

  let { contract }: Props = $props();

  let categTitle: null | string = $state(null);

  async function getPostCateg() {
    if (!contract.position_category_fk) return "None";
    const res = await apiFetch(
      `/api/position-category?position_categ_pk=${contract.position_category_fk}`
    );

    if (!res.ok) return "None";

    const categ = (await res.json()) as PositionCategory | null;

    if (!categ) return "None";

    return categ.post_categ_name;
  }
</script>

<HoverCard.Root
  openDelay={100}
  closeDelay={0}
  onOpenChange={async (open) => {
    if (!open || categTitle) return;
    categTitle = await getPostCateg();
  }}
>
  <HoverCard.Trigger class="cursor-default">
    <div class="flex items-center gap-1 hover:bg-background rounded-sm px-1">
      {formatDate(contract.start_date)}
      <ArrowRight class="text-muted-foreground size-4" />
      {formatDate(contract.end_date)}
    </div>
  </HoverCard.Trigger>
  <HoverCard.Content class="w-60" side="right">
    {@render row("Designation", contract.designation)}
    {@render row("Rate", `${contract.rate}/Month`)}

    <div class="flex items-center gap-2 pt-1 text-muted-foreground text-sm">
      <span class="font-semibold text-foreground">Category:</span>
      {#if categTitle}
        {categTitle}
      {:else}
        <Skeleton class="h-4 w-[120px]" />
      {/if}
    </div>
    {@render row("Remarks", contract.remarks ?? "None")}
  </HoverCard.Content>
</HoverCard.Root>

{#snippet row(title: string, value: undefined | string)}
  <div class="flex items-center gap-2 pt-1 text-muted-foreground text-sm">
    <span>
      <span class="font-semibold text-foreground">{title}:</span>
      {value}
    </span>
  </div>
{/snippet}
