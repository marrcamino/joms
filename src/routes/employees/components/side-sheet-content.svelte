<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { formatFullName } from "$lib/utils";
  import { apiFetch, formatDate } from "$lib/utils";
  import {
    ArrowRight,
    EllipsisVertical,
    FileX2Icon,
    Pencil,
    Plus,
    Trash2,
  } from "@lucide/svelte";
  import { onMount, untrack } from "svelte";
  import { getEmployeeContext, sheetIsVisible } from "../context.svelte";
  import type AddContractDialogType from "./add-contract-dialog.svelte";

  const context = getEmployeeContext();

  // Dialog Open states
  let addDialogState = $state(false);
  let editDialogState = $state(false);
  let deleteAlertDialogState = $state(false);
  let contractToUpdate: Contract | null = $state(null);

  let contractIdToDelete: null | number = $state(null);
  let refetching = $state(false);
  let contracts = $state({
    list: undefined as Contract[] | undefined,
    add(contract: Contract) {
      console.log("added?");

      const newList = [contract, ...($state.snapshot(this.list) ?? [])];
      addDialogState = false;
      this.list = sortContractsByLatest(newList);
    },
    async remove(id: number) {
      if (!this.list) return;

      console.log("dfgdfg");

      this.list = this.list.filter((c) => c.contract_pk !== id);
    },
  });

  let AddContractDialog: typeof AddContractDialogType | undefined =
    $state(undefined);

  function sortContractsByLatest(contracts: Contract[]) {
    return contracts.sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );
  }

  async function getContract(employeeId: number) {
    refetching = true;
    const res = await apiFetch(
      `/api/employee/contract?employee_id=${employeeId}`
    );

    if (!res.ok) {
      refetching = false;
      return;
    }

    const data = ((await res.json()) as { data: Contract[] }).data;

    contracts.list = sortContractsByLatest(data);
    refetching = false;
  }

  $effect(() => {
    context.openEmployee;

    untrack(async () => {
      if (context.openEmployee) getContract(context.openEmployee.employee_pk);
    });
  });

  onMount(async () => {
    AddContractDialog = (await import("./add-contract-dialog.svelte")).default;
  });
</script>

{#if context.openEmployee}
  {#if sheetIsVisible.current}
    <Sheet.Content side="right" class="w-[500px]">
      <ScrollArea class="h-dvh">
        <div class="px-4 pb-4">
          {@render actualContent(context.openEmployee)}
        </div>
      </ScrollArea>
    </Sheet.Content>
  {:else}
    {@render actualContent(context.openEmployee)}
  {/if}
{:else}
  <!-- This should only appear when the screen is big -->
  <div class="text-muted-foreground text-center max-[930px]:hidden">
    No employee currently selected
  </div>
{/if}

{#snippet actualContent(emp: Employee)}
  {#if AddContractDialog}
    <AddContractDialog
      bind:open={addDialogState}
      afterSave={(id) => contracts.add(id)}
    />
  {/if}

  {#await import("./edit-contract-dialog.svelte") then { default: EditContractDialog }}
    <EditContractDialog
      bind:open={editDialogState}
      bind:contract={contractToUpdate}
    />
  {/await}

  {#await import("./delete-dialog.svelte") then { default: DeleteDialog }}
    <DeleteDialog
      bind:open={deleteAlertDialogState}
      contractId={contractIdToDelete}
      afterDelete={(id) => contracts.remove(id)}
    />
  {/await}

  <div class="text-lg max-[930px]:pt-4">
    {formatFullName(
      {
        lastName: emp.lastname,
        firstName: emp.firstname,
        middleName: emp.middlename,
      },
      {
        order: "formal",
      }
    )}
  </div>

  <div class="text-muted-foreground">
    {emp.designation}
  </div>

  <div class="text-md pb-2 pt-4 flex items-center">
    <span>Duration: </span>
    <span class="text-muted-foreground ml-1">3y7m2d</span>

    <Button
      size="sm"
      class="ml-auto"
      disabled={!AddContractDialog}
      variant="secondary"
      onclick={() => (addDialogState = true)}>Add Contract</Button
    >
  </div>

  <div
    class="flex flex-col gap-2 data-[refetching]:opacity-50 data-[refetching]:pointer-events-none transition-opacity"
    data-refetching={refetching ? "" : null}
  >
    {#if contracts}
      {#each contracts.list as contract (contract.contract_pk)}
        <Item.Root variant="muted">
          <Item.Content>
            <Item.Title class="w-full ">
              <p class="flex items-center gap-1">
                <span>{formatDate(contract.start_date)}</span>
                <ArrowRight class="size-4 text-muted-foreground" />
                <span>{formatDate(contract.end_date)}</span>
              </p>

              {#if contract.is_active}
                <Badge class="px-2 bg-green-600 text-white" variant="secondary">
                  Active
                </Badge>
              {/if}

              <DropdownMenu.Root>
                <DropdownMenu.Trigger
                  class={buttonVariants({
                    variant: "ghost",
                    class:
                      "h-6 has-[>svg]:px-1 ml-auto relative rounded-sm text-muted-foreground",
                  })}
                >
                  <EllipsisVertical />
                  <span class="sr-only">open</span>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      onclick={async () => {
                        contractToUpdate = contract;
                        editDialogState = true;
                      }}
                    >
                      <Pencil />
                      Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      variant="destructive"
                      onclick={() => {
                        contractIdToDelete = contract.contract_pk;
                        deleteAlertDialogState = true;
                      }}
                    >
                      <Trash2 />
                      <!-- onclick={() => contracts.remove(contract.contract_pk)} -->
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Item.Title>
            <Item.Description class="text-wrap">
              {contract.designation}
            </Item.Description>
          </Item.Content>
        </Item.Root>
      {:else}
        <Empty.Root class="bg-muted/50 to-background h-full from-30%">
          <Empty.Header>
            <Empty.Media variant="icon">
              <FileX2Icon />
            </Empty.Media>
            <Empty.Title>No Contract Found</Empty.Title>
            <Empty.Description>
              This Job Order employee doesn’t have an active contract yet. You
              can add one below
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={!AddContractDialog}
              onclick={() => (addDialogState = true)}
            >
              <Plus />
              Add Contract
            </Button>
          </Empty.Content>
        </Empty.Root>
      {/each}
    {:else}
      {#each Array.from({ length: 5 }) as _}
        <Skeleton class="w-full rounded-md" style="height: 104.17px;" />
      {/each}
    {/if}
  </div>
{/snippet}
