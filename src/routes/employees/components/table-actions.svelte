<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Eye } from "@lucide/svelte";
  import { getEmployeeContext, sheetIsVisible } from "../context.svelte";

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
  <Button size="icon-sm" {onclick}>
    <span class="sr-only">open sheet</span>
    <Eye />
  </Button>
</div>
