<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { getEmployeeContext } from "../context.svelte";

  interface Props {
    employee: Employee;
  }

  let { employee }: Props = $props();
  const context = getEmployeeContext();

  function onclick() {
    context.openEmployee = employee;
    context.sheetOpenState = true;
  }
</script>

<div class="place-self-center">
  <Button {onclick} size="sm">
    <span>View</span>
  </Button>
</div>
