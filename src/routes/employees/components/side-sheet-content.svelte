<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { formatDate, formatFullName } from "$lib/utils";
  import { ArrowRight, FileX2Icon, Plus } from "@lucide/svelte";
  import { onMount, untrack } from "svelte";
  import {
    getEmployeeContext,
    setSideSheetContentContext,
    sheetIsVisible,
  } from "../context.svelte";
  import type AddContractDialogType from "./add-contract-dialog.svelte";
  import ContractCardActions from "./contract-card-actions.svelte";
  import DurationPreview from "./duration-preview.svelte";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { UserPen } from "@lucide/svelte";

  const context = getEmployeeContext();
  /**Current Open Employee Context*/
  const sheetContext = setSideSheetContentContext();

  let refetching = $state(false);

  let AddContractDialog: typeof AddContractDialogType | undefined =
    $state(undefined);

  $effect(() => {
    context.openEmployee;
    untrack(async () => {
      if (!context.openEmployee) return;
      sheetContext.getContract(context.openEmployee.employee_pk);
    });
  });

  onMount(async () => {
    AddContractDialog = (await import("./add-contract-dialog.svelte")).default;
  });
</script>

{#if sheetIsVisible.current}
  <Sheet.Root bind:open={context.sheetOpenState}>
    {@render sheetContent()}
  </Sheet.Root>
{:else}
  <div class="pl-4 w-[400px] min-w-[400px]">
    <div class="border rounded-lg p-4">
      {@render sheetContent()}
    </div>
  </div>
{/if}

{#snippet sheetContent()}
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
{/snippet}

{#snippet actualContent(emp: Employee)}
  {#if AddContractDialog}
    <AddContractDialog
      bind:open={sheetContext.addDialogState}
      afterSave={(id) => {
        sheetContext.add(id);
        sheetContext.addDialogState = false;
      }}
    />
  {/if}

  {#await import("./edit-contract-dialog.svelte") then { default: EditContractDialog }}
    <EditContractDialog
      bind:open={sheetContext.editDialogState}
      afterUpdate={(c) => sheetContext.update(c)}
    />
  {/await}

  {#await import("./delete-alert-dialog.svelte") then { default: DeleteAlertDialog }}
    <DeleteAlertDialog
      bind:open={sheetContext.deleteAlertDialogState}
      afterDelete={(id) => sheetContext.remove(id)}
    />
  {/await}

  {#await import("./activate-contract-alert-dialog.svelte") then { default: ActiveContractAlertDialog }}
    <ActiveContractAlertDialog
      bind:open={sheetContext.activeContractAlertDialogState}
    />
  {/await}

  {#await import("./deactivate-contract-alert-dialog.svelte") then { default: DeactiveContractAlertDialog }}
    <DeactiveContractAlertDialog
      bind:open={sheetContext.deactiveContractAlertDialogState}
    />
  {/await}

  {#await import("./edit-employee-dialog.svelte") then { default: EditEmployeeDialog }}
    <EditEmployeeDialog bind:open={sheetContext.editEmployeeState} />
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
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger
          class={buttonVariants({
            variant: "secondary",
            class: "relative h-6 !px-1.5 text-muted-foreground translate-y-0.5",
          })}
          onclick={() => (sheetContext.editEmployeeState = true)}
        >
          <UserPen />
          <span class="sr-only">edit</span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Edit Employee Info</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  </div>

  <div
    class="text-muted-foreground line-clamp-2 cursor-help"
    title={emp.designation}
  >
    {emp.designation}
  </div>

  <div class="pb-2 pt-4 flex items-center">
    <DurationPreview />

    <Button
      size="sm"
      class="ml-auto"
      disabled={!AddContractDialog}
      variant="secondary"
      onclick={() => (sheetContext.addDialogState = true)}>Add Contract</Button
    >
  </div>

  <div
    class="flex flex-col gap-2 data-[refetching]:opacity-50 data-[refetching]:pointer-events-none transition-opacity"
    data-refetching={refetching ? "" : null}
  >
    {#if sheetContext}
      {#each sheetContext.contracts as contract (contract.contract_pk)}
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

              <ContractCardActions {contract} />
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
              onclick={() => (sheetContext.addDialogState = true)}
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
