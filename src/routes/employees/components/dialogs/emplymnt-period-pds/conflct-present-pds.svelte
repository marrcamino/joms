<script lang="ts">
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { formatDate } from "$lib/utils";
  import { CircleAlert } from "@lucide/svelte";

  interface Props {
    startDate: string;
  }

  let { startDate }: Props = $props();
</script>

<div>
  <Alert.Root variant="danger" class="pr-0.5">
    <CircleAlert />
    <Alert.Title>Conflicting PDS period</Alert.Title>

    <Alert.Description class="inline">
      An ongoing PDS period exists starting on <b>{formatDate(startDate)}</b>.
      Only one ongoing &lpar;<b>Present</b>&rpar; period is allowed per employee
    </Alert.Description>
  </Alert.Root>
</div>
