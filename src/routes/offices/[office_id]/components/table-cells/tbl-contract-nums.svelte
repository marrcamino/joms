<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { apiFetch } from "$lib/utils";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { getOfficeAllTransmittalContext } from "../../context.svelte";

  interface Props {
    counts?: number;
    transmittal_pk: number;
  }

  let { counts, transmittal_pk }: Props = $props();

  let offcAllTransCtx = getOfficeAllTransmittalContext();
  onMount(async () => {
    const res = await apiFetch(
      `/api/transmittal/transmittal-item?transmittal_fk=${transmittal_pk}`
    );

    if (!res.ok) return;

    const data = (await res.json()) as TransmittalItem[];

    offcAllTransCtx.updateTransmittalContractCounts(
      transmittal_pk,
      data.length
    );
  });
</script>

<div class="relative">
  {#if counts !== undefined}
    <div in:fade={{ delay: 300 }}>{counts}</div>
  {:else}
    <div out:fade class="absolute top-1/2 -translate-y-1/2">
      <Skeleton class="h-4 w-[30px]" />
    </div>
  {/if}
</div>
