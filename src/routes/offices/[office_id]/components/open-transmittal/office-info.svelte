<script lang="ts">
  import { getOfficeStoreContext } from "$lib/context/office-store.svelte";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { fade } from "svelte/transition";

  interface Props {
    office_pk: number;
  }

  let { office_pk }: Props = $props();

  const storeContext = getOfficeStoreContext();
  let arr = ["30", "35", "40", "45", "50"];
  const width = `${arr[Math.floor(Math.random() * arr.length)]}`;
</script>

<div class="absolute inset-0">
  <div class="size-full relative flex">
    {#if !storeContext.fetching}
      {#await storeContext.getOffice(office_pk)}
        <div
          out:fade
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Skeleton class="h-4" style="width:{width}px" />
        </div>
      {:then office}
        <div class="m-auto" in:fade={{ delay: 300 }}>{office?.office_abbr}</div>
      {/await}
    {:else}
      <div
        out:fade
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Skeleton class="h-4" style="width:{width}px" />
      </div>
    {/if}
  </div>
</div>
