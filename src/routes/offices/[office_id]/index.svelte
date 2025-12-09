<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index";
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { apiFetch } from "$lib/utils";
  import { Plus, Save } from "@lucide/svelte";
  import { onMount, tick } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade, fly } from "svelte/transition";
  import { setDraftTransmittalContext } from "../components/transmittal-dialog/context.svelte";
  import { getOfficeContext } from "../context.svelte";
  import AddEditTransmittalPage from "./components/add-edit-transmittal-page.svelte";
  import DeleteDialog from "./components/delete-dialog.svelte";
  import Tbl from "./components/open-transmittal/tbl.svelte";
  import { setOfficeAllTransmittalContext } from "./context.svelte";
  import OfficeTransmittalTbl from "./office-transmittal-tbl.svelte";

  let pageIsReady = $state(false);

  const officeCtx = getOfficeContext();
  /** Office Transmittal Context*/
  const officeTxCtx = setOfficeAllTransmittalContext();
  /** Office Transmittal Draft Context*/
  const txDraftCtx = setDraftTransmittalContext();
  let isSubmitting = $state(false);
  let alterDialogState = $state(false);

  function closePage() {
    officeCtx.transmittalPageState = false;
    txDraftCtx.resetData();
    alterDialogState = false;
  }

  async function save() {
    try {
      if (isSubmitting) return;
      isSubmitting = true;
      const office_pk = txDraftCtx.office?.office_pk;

      if (!office_pk) {
        console.error("No Office: ", office_pk);
        return;
      }

      const data = $state.snapshot(txDraftCtx.empTrans);
      if (!data.length) return;

      const remarks =
        (document.getElementById("remarks") as HTMLTextAreaElement)?.value ||
        null;

      const dateRange = txDraftCtx.getDateRange();
      if (!dateRange) {
        console.error("Walay date range");
        return;
      }

      const newTransmittal = {
        remarks,
        transmittals: data,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        funding_charge: txDraftCtx.getSourceFunds(),
      };
      const res = await apiFetch(
        `/api/office/transmittal?office_pk=${office_pk}`,
        {
          method: "POST",
          body: JSON.stringify(newTransmittal),
        }
      );

      if (!res.ok) {
        toast.error("Unable to save transmittal");
        return;
      }

      const transmittal_pk = ((await res.json()) as any)
        .transmittal_pk as number;
      officeTxCtx.addTransmittal({
        ...newTransmittal,
        transmittal_pk,
        office_fk: office_pk,
        numOfEmp: txDraftCtx.empTrans.length,
      });
      toast.success("Transmittal saved successfully");

      officeCtx.transmittalPageState = false;
      await tick();
      txDraftCtx.empTrans = [];
    } finally {
      isSubmitting = false;
    }
  }

  onMount(async () => {
    if (officeCtx.addTransmittal) {
      officeCtx.transmittalPageState = true;
      await tick();
      txDraftCtx.addEmpDialogState = true;
      officeCtx.addTransmittal = false;
    }

    let officeId = $state(window.location.hash.split("/")[2]);
    if (!officeId) {
      pageIsReady = false;
      return;
    }

    // Verify that the office exists in the database
    const res = await apiFetch(`/api/office?office_pk=${officeId}`);
    if (!res.ok) {
      pageIsReady = false;
      return;
    }
    const theOffice = (await res.json()) as Office | null;

    if (!theOffice) {
      pageIsReady = false;
      return;
    }
    pageIsReady = true;

    txDraftCtx.office = theOffice;
    officeTxCtx.office = theOffice;

    const res2 = await apiFetch(
      `/api/office/transmittal?office_fk=${officeTxCtx.office.office_pk}`
    );

    if (!res2.ok) return;

    const data2 = (await res2.json()) as Transmittal[];

    officeTxCtx.transmittals = data2;
  });
</script>

<svelte:head>
  {#if pageIsReady && officeTxCtx.office}
    <title>Office / {officeTxCtx.office.office_abbr}</title>
  {:else}
    <title>Office</title>
  {/if}
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div class="flex w-full items-center">
      {#if pageIsReady && officeTxCtx.office}
        <div class="flex-1 truncate md:ml-2">
          <Breadcrumb.Root>
            <Breadcrumb.List>
              {#if !officeCtx.transmittalPageState}
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="/#/offices">Office</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
              {/if}
              <Breadcrumb.Item>
                <Breadcrumb.Page>
                  {#if officeCtx.transmittalPageState}
                    <span>Add Transmittal - </span>
                  {/if}
                  {officeTxCtx.office.office_abbr}
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>
      {/if}
    </div>

    {#if officeCtx.transmittalPageState}
      <Button
        variant="ghost-destructive"
        size="sm"
        onclick={() => {
          if (txDraftCtx.empTrans.length) {
            alterDialogState = true;
            return;
          }

          officeCtx.transmittalPageState = false;
        }}
      >
        <!-- <Plus /> -->
        <span>Cancel</span>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onclick={() => (txDraftCtx.addEmpDialogState = true)}
      >
        <Plus />
        <span>Add Employee</span>
      </Button>
      <Button size="sm" class="ml-auto" onclick={save}>
        <Save />
        <span>Save</span>
      </Button>
    {:else}
      <Button
        size="sm"
        class="ml-auto mr-2"
        onclick={async () => {
          officeCtx.transmittalPageState = true;
        }}
      >
        <Plus />
        <span>Add Transmittal</span>
      </Button>
    {/if}
  {/snippet}
  <div class="p-4">
    <OfficeTransmittalTbl />
  </div>

  {#if officeCtx.transmittalPageState}
    <div
      transition:fade={{ duration: 200 }}
      class="absolute inset-0 bg-background overflow-auto z-10"
    >
      <div transition:fly={{ y: 20, duration: 200 }} class="p-4">
        <AddEditTransmittalPage />
      </div>
    </div>
  {/if}
</RouteContent>

<DeleteDialog />

<AlertDialog.Root bind:open={alterDialogState}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Leave without saving?</AlertDialog.Title>
      <AlertDialog.Description>
        You have unsaved changes. Leaving now will discard them.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Continue Editing</AlertDialog.Cancel>
      <AlertDialog.Action
        class={buttonVariants({ variant: "destructive" })}
        onclick={closePage}>Discard Changes</AlertDialog.Action
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<Drawer.Root
  bind:open={officeTxCtx.drawerState}
  handleOnly
  onOpenChangeComplete={(open) => {
    if (!open) {
      officeTxCtx.openTransmittal = null;
      txDraftCtx.resetData();
    }
  }}
>
  <Drawer.Content
    noHandle
    escapeKeydownBehavior="ignore"
    class="min-h-[calc(100dvh_-_90px)] *:select-text  outline-none"
  >
    <Tbl />
  </Drawer.Content>
</Drawer.Root>

{#await import("./components/create-from-exist-trans/create-from-exist-trans.svelte") then CreateFromExistTrans}
  <CreateFromExistTrans.default />
{/await}
