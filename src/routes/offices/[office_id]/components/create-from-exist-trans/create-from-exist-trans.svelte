<script lang="ts">
  import AnimateContent from "$lib/components/animate-content.svelte";
  import DateDisplay from "$lib/components/display/date-display.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { apiFetch, cn, formatDate, nDate } from "$lib/utils";
  import { getDraftTransmittalContext } from "$routes/offices/components/transmittal-dialog/context.svelte";
  import type { DateValue } from "@internationalized/date";
  import { ArrowDown, ArrowUp, Check, CheckIcon } from "@lucide/svelte";
  import { untrack } from "svelte";
  import { fade, slide } from "svelte/transition";
  import SetDateRange from "./set-date-range.svelte";
  import TransInfo, { setPickEmpContext } from "./trans-info.svelte";

  const drftTransCtx = getDraftTransmittalContext();
  const pickEmpsContext = setPickEmpContext();
  const placeholder = `Search by date (e.g., ${formatDate().replaceAll(",", "")} or ${nDate.getISOToday})`;
  const ANIMATE_DURATION = 250;

  let transmittals: Transmittal[] = $state([]);
  let isFetchingTransmittal = $state(true);
  let heading = $derived.by(() => {
    if (transmittals.length === 1) return "Recent Transmittal";
    return `Recent Transmittals (${transmittals.length})`;
  });
  let searchValue = $state(""); // Use only to dynamically appear the command empty kay naay probs when animating in sa command
  let step: 1 | 2 | 3 = $state(1);

  // FOR OVERLAP DATES
  let startDate: DateValue | undefined = $state();
  let endDate: DateValue | undefined = $state();
  let overlapContracts: Contract[] = $state([]);
  let hadOverlap = $derived(!!overlapContracts.length);
  let numOfDays: string | null = $state(null);

  let primaryBtnDisableState = $derived.by(() => {
    if (step === 1) {
      if (!pickEmpsContext.selectedTransmittal) return true;
      return false;
    }

    if (step === 2) {
      if (!pickEmpsContext.pickedEms.length) return true;
      return false;
    }

    if (step === 3) {
      if (hadOverlap) return true;
      return false;
    }

    return false;
  });
  let step3IsOke = $derived.by(() => {
    if (hadOverlap) return false;
    if (!startDate && !endDate) return false;
    return true;
  });

  function setStep(value: 1 | 2 | 3) {
    step = value;
  }

  function resetValues() {
    transmittals = [];
    isFetchingTransmittal = false;
    pickEmpsContext.selectedTransmittal = undefined;
    searchValue = "";
    step = 1;

    pickEmpsContext.emps = [];
    pickEmpsContext.lastId = null;
    pickEmpsContext.selectedTransmittal = undefined;
    pickEmpsContext.pickedEms = [];

    overlapContracts = [];
    numOfDays = null;
    startDate = undefined;
    endDate = undefined;
  }

  function addToDraftCtx() {
    if (!numOfDays || numOfDays === "0" || numOfDays === "") {
      document.getElementById("num_of_days")?.focus();
      return;
    }
    drftTransCtx.bulkAdd($state.snapshot(pickEmpsContext.pickedEms), {
      start_date: startDate!.toString(),
      end_date: endDate!.toString(),
      num_of_days: numOfDays,
    });
    drftTransCtx.useTransDialogState = false;
  }

  // Getting transmittals
  $effect(() => {
    drftTransCtx.useTransDialogState;
    untrack(async () => {
      if (!drftTransCtx.useTransDialogState) return;
      const office_pk = drftTransCtx.office?.office_pk;
      if (!office_pk) {
        console.error("Walay office_pk, dili maka fetch sa transmittal");
      }
      try {
        isFetchingTransmittal = true;
        const res = await apiFetch(
          `/api/transmittal?office_pk=${office_pk}&limit=10`
        );

        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as Transmittal[];
        transmittals = data;
      } finally {
        isFetchingTransmittal = false;
      }
    });
  });

  // Checks overlaps dates of transmittal
  $effect(() => {
    startDate;
    endDate;

    untrack(async () => {
      if (!startDate || !endDate) return;

      const res = await apiFetch(`/api/transmittal/check-overlap`, {
        method: "POST",
        body: JSON.stringify({
          startDate: startDate.toString(),
          endDate: endDate.toString(),
        }),
      });

      if (!res.ok) {
        return;
      }

      overlapContracts = (await res.json()).overlaps as Contract[];
    });
  });
</script>

<Dialog.Root
  bind:open={drftTransCtx.useTransDialogState}
  onOpenChangeComplete={(open) => {
    if (!open) resetValues();
  }}
>
  <Dialog.Content>
    <div class="">
      <div class="text-sm font-semibold flex gap-2 mb-1">
        <div
          data-checked={pickEmpsContext.selectedTransmittal ? "" : null}
          class="rounded-full size-5 transition-colors data-checked:bg-green-600 bg-accent text-center flex items-center justify-center text-xs"
        >
          {#if pickEmpsContext.selectedTransmittal}
            <Check class="size-3" />
          {:else}
            1
          {/if}
        </div>
        <button
          disabled={step === 1}
          tabindex="-1"
          class="hover:opacity-70 disabled:hover:opacity-100 disabled:cursor-default"
          onclick={() => setStep(1)}
        >
          Choose Transmittal
        </button>
      </div>
      <div class="border-l pl-2 ml-2 pb-4">
        {#if step === 1}
          <AnimateContent animationDuration={ANIMATE_DURATION}>
            <div class="pl-3">
              <Command.Root
                class="border"
                value={String(
                  pickEmpsContext.selectedTransmittal?.transmittal_pk ?? ""
                )}
              >
                <Command.Input {placeholder} bind:value={searchValue} />
                <Command.List class="min-h-[68px]">
                  {#if searchValue}
                    <Command.Empty>No transmittals found</Command.Empty>
                  {/if}
                  <Command.Group {heading}>
                    {#each transmittals as t}
                      {@const removeComma = (d: string) =>
                        formatDate(d).replaceAll(",", "")}
                      <Command.Item
                        keywords={[
                          t.start_date,
                          t.end_date,
                          removeComma(t.start_date),
                          removeComma(t.end_date),
                        ]}
                        value={String(t.transmittal_pk)}
                        onclick={() => {
                          pickEmpsContext.emps = [];
                          pickEmpsContext.pickedEms = [];
                          pickEmpsContext.selectedTransmittal = t;
                        }}
                      >
                        <CheckIcon
                          class={cn(
                            pickEmpsContext.selectedTransmittal
                              ?.transmittal_pk !== t.transmittal_pk &&
                              "text-transparent"
                          )}
                        />
                        <DateDisplay date={t} />
                      </Command.Item>
                    {:else}
                      {#if isFetchingTransmittal}
                        <Command.Item disabled class="gap-1 py-8 border flex ">
                          <div class="m-auto text-foreground">
                            Getting
                            <span class="font-semibold">
                              {drftTransCtx.office?.office_abbr}
                            </span> transmittals...
                          </div>
                        </Command.Item>
                      {/if}
                    {/each}
                  </Command.Group>
                </Command.List>
              </Command.Root>
            </div>
          </AnimateContent>
        {/if}
      </div>

      <!-- ###################### -->
      <div class="text-sm font-semibold flex gap-2 mb-1 mt-1">
        <div
          data-checked={pickEmpsContext.pickedEms.length ? "" : null}
          class="rounded-full size-5 bg-accent text-center flex data-checked:bg-green-600 items-center justify-center text-xs"
        >
          {#if pickEmpsContext.pickedEms.length}
            <Check class="size-3" />
          {:else}
            2
          {/if}
        </div>

        <button
          disabled={!pickEmpsContext.selectedTransmittal}
          tabindex="-1"
          class="hover:opacity-70 disabled:hover:opacity-100 disabled:cursor-default"
          onclick={() => setStep(2)}
        >
          Pick Employees</button
        >
      </div>

      <div class="border-l pl-2 ml-2 pb-4">
        {#if step === 2}
          <AnimateContent animationDuration={ANIMATE_DURATION}>
            <div class="pl-2">
              <TransInfo />
            </div>
          </AnimateContent>
        {/if}
      </div>

      <!-- ###################### -->
      <div class="text-sm font-semibold flex gap-2 mb-1 mt-1">
        <div
          data-checked={step3IsOke ? "" : null}
          class="rounded-full size-5 bg-accent text-center flex data-checked:bg-green-600 items-center justify-center text-xs"
        >
          {#if step3IsOke}
            <Check class="size-3" />
          {:else}
            3
          {/if}
        </div>

        <button
          disabled={!pickEmpsContext.pickedEms.length}
          tabindex="-1"
          class="hover:opacity-70 disabled:hover:opacity-100 disabled:cursor-default"
          onclick={() => setStep(3)}
        >
          Set Date Range</button
        >
      </div>

      <div class="border-l pl-2 ml-2 pb-4">
        {#if step === 3}
          <AnimateContent animationDuration={ANIMATE_DURATION}>
            <div class="pl-3">
              <div class="pb-2 text-muted-foreground text-sm pt-4">
                Set the start and end dates for the new transmittal.
              </div>
              <SetDateRange
                bind:startDate
                bind:endDate
                bind:overlapContracts
                bind:numOfDays
                {hadOverlap}
              />
            </div>
          </AnimateContent>
        {/if}
      </div>
    </div>

    <Dialog.Footer>
      <Button
        type="button"
        variant="ghost-destructive"
        class="mr-auto"
        onclick={() => {
          drftTransCtx.useTransDialogState = false;
        }}
      >
        Cancel
      </Button>

      <Button
        disabled={step === 1}
        type="button"
        variant="secondary"
        class=""
        onclick={() => setStep((step - 1) as any)}
      >
        <ArrowUp />
        <span>Previous</span>
      </Button>
      <Button
        disabled={primaryBtnDisableState}
        type="button"
        onclick={() => {
          if (step === 3) {
            addToDraftCtx();
            return;
          }
          setStep((step + 1) as any);
        }}
        style="min-width: 73px"
        class="flex gap-0"
      >
        {#if step < 3}
          <div transition:slide={{ axis: "x" }}>
            <div transition:fade={{ delay: 300 }}>
              <ArrowDown class="inline -translate-y-0.5" />
              <span>Next</span>
            </div>
          </div>
        {:else}
          <div transition:slide={{ axis: "x" }}>
            <div transition:fade={{ delay: 300 }}>Create</div>
          </div>
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
