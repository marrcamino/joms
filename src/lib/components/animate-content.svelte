<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, slide } from "svelte/transition";
  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div transition:slide={{ axis: "y", delay: 300 }}>
  <div in:fade={{ delay: 400 }} out:fade>
    {@render children()}
  </div>
</div>
