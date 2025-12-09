<script lang="ts">
  interface Props {
    remarks: string | null;
  }

  let { remarks }: Props = $props();
</script>

{#if !remarks || !remarks.trim()}
  <span class="italic text-muted-foreground">None</span>
{:else}
  {remarks}
{/if}
