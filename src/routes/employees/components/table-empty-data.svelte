<script lang="ts">
  import {
    Row as TableRow,
    Cell as TableCell,
  } from "$lib/components/ui/table/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { UsersRound } from "@lucide/svelte";

  interface Props {
    columnsLenth: number;
  }

  let { columnsLenth: colspan }: Props = $props();
</script>

<TableRow class="hover:[&>th,td]:!bg-transparent">
  <TableCell {colspan} class="text-center">
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <UsersRound />
        </Empty.Media>
        <Empty.Title>No Employee Yet</Empty.Title>
        <Empty.Description>
          There are no employees listed at the moment. Start by adding a new
          employee to the system.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button href="/#/employees/new">Add Employee</Button>
      </Empty.Content>
    </Empty.Root>
  </TableCell>
</TableRow>
