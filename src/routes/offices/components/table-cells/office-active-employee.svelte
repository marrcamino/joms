<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { apiFetch } from "$lib/utils";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  interface Props {
    office: Office;
  }

  let { office }: Props = $props();

  let counts: number | undefined = $state(undefined);

  type ActiveEmployee = Employee & {
    office_fk: number;
    designation: string;
    is_active: 1;
  };

  onMount(async () => {
    const res = await apiFetch(
      `/api/get-emp-counts?office_pk=${office.office_pk}`
    );

    if (!res.ok) return;

    const data = ((await res.json()) as { data: ActiveEmployee[] }).data;
    counts = data.length;
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
