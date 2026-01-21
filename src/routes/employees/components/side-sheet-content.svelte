<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { setPositionCategoryStoreContext } from "$lib/context/appointment-categ-store.svelte";
  import { formatFullName } from "$lib/utils";
  import { ChevronDown, FileX, ListRestart } from "@lucide/svelte";
  import { untrack } from "svelte";
  import {
    getEmployeeContext,
    getSideSheetContentContext,
    sheetIsVisible,
  } from "../context.svelte";
  import AddContractDialog from "./dialogs/contract/add/add-contract-dialog.svelte";
  import EditContractDialog from "./dialogs/contract/edit/edit-contract-dialog.svelte";
  import EmplymntPeriodPds from "./dialogs/pds-record/emplymnt-period-pds.svelte";
  import EditTransmittalItem from "./dialogs/edit-transmittal-item/root.svelte";

  import DurationPreview from "./duration-preview.svelte";
  import RecordItem from "./record-item.svelte";

  const context = getEmployeeContext();
  /**Current Open Employee Context*/
  const sheetContext = getSideSheetContentContext();
  const positionCategoryStore = setPositionCategoryStoreContext(
    sheetContext.contracts ?? [],
  );

  let refetching = $state(false);

  async function getData() {
    if (!context.openEmployee) return;
    await sheetContext.getContract(context.openEmployee.employee_pk);

    const contracts = $state.snapshot(sheetContext.contracts);

    if (contracts) positionCategoryStore.fetchCategories(contracts);
  }
  $effect(() => {
    context.openEmployee;
    untrack(async () => await getData());
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
      <Sheet.Content
        side="right"
        class="w-[500px]"
        portalProps={{ to: "main" }}
      >
        <ScrollArea viewPortClasses="max-h-dvh">
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
  <div class="text-lg max-[930px]:pt-4">
    {formatFullName(emp)}
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
      variant="ghost"
      size="sm"
      class="ml-auto mr-1"
      onclick={async () => await getData()}
    >
      <ListRestart />
      Refresh
    </Button>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class={buttonVariants({
          variant: "secondary",
          size: "sm",
        })}
      >
        Add Record
        <ChevronDown />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Item
            onclick={() => (sheetContext.addDialogState = true)}
            >Contract</DropdownMenu.Item
          >
          <DropdownMenu.Item
            class="gap-1"
            onclick={() => {
              sheetContext.editPdsDialogState = true;
            }}
          >
            PDS Record
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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
              <FileX />
            </Empty.Media>
            <Empty.Title>No Contract Found</Empty.Title>
            <Empty.Description>
              This Job Order employee doesn’t have an active contract yet. You
              can add one below
            </Empty.Description>
            <Empty.Content>
              <Button
                size="sm"
                onclick={() => (sheetContext.addDialogState = true)}
                >Add Contract</Button
              >
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

<AddContractDialog />
<EditContractDialog />
<EditTransmittalItem />

<EmplymntPeriodPds />

{#await import("./dialogs/delete-contract-alert-dialog.svelte") then { default: DeleteAlertDialog }}
  <DeleteAlertDialog bind:open={sheetContext.deleteContractAlertDialogState} />
{/await}

{#await import("./dialogs/activate-contract-alert-dialog.svelte") then { default: ActiveContractAlertDialog }}
  <ActiveContractAlertDialog
    bind:open={sheetContext.activeContractAlertDialogState}
  />
{/await}

{#await import("./dialogs/deactivate-contract-alert-dialog.svelte") then { default: DeactiveContractAlertDialog }}
  <DeactiveContractAlertDialog
    bind:open={sheetContext.deactiveContractAlertDialogState}
  />
{/await}

{#await import("./dialogs/delete-transmittal-item-entry-alert-dialog.svelte") then { default: DeleteTransEntryAltetDialog }}
  <DeleteTransEntryAltetDialog />
{/await}
