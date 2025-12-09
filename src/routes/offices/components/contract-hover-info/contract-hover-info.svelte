<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { apiFetch, formatFullName } from "$lib/utils";
  import { onMount } from "svelte";
  import ContractCategoryHoverCard from "./contract-category-hover-card.svelte";

  type GroupedContracts = {
    employee_fk: number;
    contracts: Contract[];
  };

  let employee: null | string = $state(null);

  interface Props {
    data: GroupedContracts;
  }

  let { data }: Props = $props();

  onMount(async () => {
    const res = await apiFetch(`/api/employee?employee_pk=${data.employee_fk}`);

    if (!res.ok) return;

    const e = (await res.json()) as Employee;

    employee = formatFullName(e);
  });
</script>

<div class="border rounded-md py-2 px-3 bg-muted/50 w-[230px]">
  <div class="text-muted-foreground flex items-center pl-1">
    {#if employee}
      {employee}
    {:else}
      <Skeleton class="h-4 w-[120px" />
    {/if}
  </div>
  <div class="text-foreground">
    {#each data.contracts as contract}
      <ContractCategoryHoverCard {contract} />
    {/each}
  </div>
</div>
