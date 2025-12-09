<script lang="ts">
  import { Textarea } from "$lib/components/ui/textarea";

  let value = $state("");

  $effect(() => {
    value = value.slice(0, 255);
  });
</script>

<div class="relative">
  <Textarea id="remarks" name="remarks" autoHeight autoTrim bind:value />

  {#if 255 - value.length < 16}
    <div
      class="text-xs bg-muted absolute -top-6 right-0 border rounded-sm px-1 py-[1px]"
    >
      {value.length}/{255}
    </div>
  {/if}
</div>
