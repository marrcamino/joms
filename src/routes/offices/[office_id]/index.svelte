<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { apiFetch } from "$lib/utils";
  import { ArrowLeft, Plus } from "@lucide/svelte";
  import { onMount, tick } from "svelte";
  import OfficeTransmittalTbl from "./office-transmittal-tbl.svelte";
  import { setOfficeTransmittalContext } from "./context.svelte";
  import { getOfficeContext } from "../context.svelte";
  import { fade, fly } from "svelte/transition";
  import AddEditTransmittalPage from "../components/add-edit-transmittal-page.svelte";
  import { setTransmittalContext } from "../components/transmittal-dialog/context.svelte";

  let pageIsReady = $state(false);
  let office: Office | null = $state(null);
  const context = setOfficeTransmittalContext();
  const officeContext = getOfficeContext();
  const transContext = setTransmittalContext();

  onMount(async () => {
    let officeId = $state(window.location.hash.split("/")[2]);
    if (!officeId) {
      pageIsReady = false;
      return;
    }
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

    office = theOffice;

    const res2 = await apiFetch(
      `/api/office/transmittal?office_fk=${office.office_pk}`
    );

    if (!res2.ok) return;

    const data2 = (await res2.json()) as Transmittal[];

    context.transmittals = data2;
  });
</script>

<svelte:head>
  {#if pageIsReady && office}
    <title>Office | {office.office_abbr}</title>
  {:else}
    <title>Office</title>
  {/if}
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div class="flex w-full items-center">
      {#if pageIsReady && office}
        <div class="flex-1 truncate">
          {#if officeContext.transmittalPageState}
            Add Transmittal
            <span class="text-muted-foreground">-</span>
          {:else}
            Office Transmittal
            <span class="text-muted-foreground">|</span>
          {/if}

          <span class="text-nowrap truncate inline">
            {office.office_abbr}
          </span>
        </div>
      {/if}
    </div>
    <Button
      variant={officeContext.transmittalPageState
        ? "ghost-destructive"
        : "ghost"}
      size="sm"
      class="ml-auto"
      onclick={() => {
        if (officeContext.transmittalPageState) {
          officeContext.transmittalPageState = false;
        } else {
          history.back();
        }
      }}
    >
      {#if !officeContext.transmittalPageState}
        <ArrowLeft />
      {/if}
      <span>{officeContext.transmittalPageState ? "Cancel" : "Go Back"} </span>
    </Button>
    {#if officeContext.transmittalPageState}
      <Button
        size="sm"
        class="ml-auto"
        onclick={() => (transContext.secondDialogState = true)}
      >
        <Plus />
        <span>Add Row</span>
      </Button>
    {:else}
      <Button
        size="sm"
        class="ml-auto"
        onclick={async () => {
          officeContext.transmittalPageState = true;
          await tick();
          transContext.secondDialogState = true;
        }}
      >
        <Plus />
        <span>Add Transmittal</span>
      </Button>
    {/if}
  {/snippet}
  <div class="p-4"><OfficeTransmittalTbl /></div>

  {#if officeContext.transmittalPageState}
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
