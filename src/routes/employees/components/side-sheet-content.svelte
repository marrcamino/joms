<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { formatFullName } from "$lib/utils";
  import { FileX2Icon } from "@lucide/svelte";
  import { onMount, untrack } from "svelte";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
    sheetIsVisible,
  } from "../context.svelte";
  import type AddContractDialogType from "./add-contract-dialog.svelte";
  import DurationPreview from "./duration-preview.svelte";
  import RecordItem from "./record-item.svelte";

  const context = getEmployeeContext();
  /**Current Open Employee Context*/
  const sheetContext = getSideSheetContentContext();

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

  {#await import("./delete-contract-alert-dialog.svelte") then { default: DeleteAlertDialog }}
    <DeleteAlertDialog
      bind:open={sheetContext.deleteContractAlertDialogState}
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

  <div class="text-lg max-[930px]:pt-4">
    {formatFullName(
      {
        lastName: emp.lastname,
        firstName: emp.firstname,
        middleName: emp.middlename,
        extension: emp.extension,
      },
      { order: "formal" }
    )}
  </div>

  <div style="min-height: 25.5px;">
    {#if emp.designation}
      <div
        class="text-muted-foreground w-max cursor-help leading-5 hover:text-foreground/70"
        title={emp.designation}
        style="width: 347px;"
      >
        {emp.designation}
      </div>
    {:else}
      <Badge variant="outline-destructive">Inactive</Badge>
    {/if}
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
        <RecordItem {contract} />
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
            <Empty.Content>
              <Button size="sm">Add Contract</Button>
            </Empty.Content>
          </Empty.Header>
        </Empty.Root>
      {/each}
    {:else}
      {#each Array.from({ length: 5 }) as _}
        <Skeleton class="w-full rounded-md" style="height: 104.17px;" />
      {/each}
    {/if}
  </div>
{/snippet}
