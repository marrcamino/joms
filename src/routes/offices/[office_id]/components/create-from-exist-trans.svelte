<script lang="ts">
  import DateDisplay from "$lib/components/date-display.svelte";
  import DateRangePicker from "$lib/components/date/date-range-picker.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { apiFetch, cn, formatDate, nDate } from "$lib/utils";
  import { getDraftTransmittalContext } from "$routes/offices/components/transmittal-dialog/context.svelte";
  import { untrack } from "svelte";
  import CheckIcon from "@lucide/svelte/icons/check";

  const drftTransCtx = getDraftTransmittalContext();

  let checkDialogState = $state(false);
  let transmittals: Transmittal[] = $state([]);
  let isFetchingTransmittal = $state(true);
  let selectedTransmittal = $state("");
  let startDateDisabled = $derived(selectedTransmittal.trim() === "");
  let heading = $derived.by(() => {
    if (transmittals.length === 1) return "Previous transmittal";
    return `Previous ${transmittals.length} transmittals`;
  });
  const placeholder = `Search dates e.g., ${formatDate().replaceAll(",", "")} or ${nDate.getISOToday}`;

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
</script>

<Dialog.Root bind:open={drftTransCtx.useTransDialogState}>
  <Dialog.Content
    data-nested={checkDialogState ? "" : null}
    class="data-nested:scale-95"
  >
    <Dialog.Header>
      <Dialog.Title>Create Transmittal</Dialog.Title>
      <!-- <Dialog.Description>
        Make changes to your profile here. Click save when you&apos;re done.
      </Dialog.Description> -->
    </Dialog.Header>
    <div>
      <div>
        <Command.Root class="rounded-lg border" value={selectedTransmittal}>
          <Command.Input {placeholder} />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
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
                    selectedTransmittal = String(t.transmittal_pk);
                    // console.log($state.snapshot(drftTransCtx.office));
                  }}
                >
                  <CheckIcon
                    class={cn(
                      selectedTransmittal !== String(t.transmittal_pk) &&
                        "text-transparent"
                    )}
                  />
                  <DateDisplay date={t} />
                  <Button
                    size="xs"
                    class="ml-auto"
                    onclick={(e) => {
                      e.stopPropagation();
                      checkDialogState = true;
                    }}>Check</Button
                  >
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

      <div class="mt-4">
        <DateRangePicker allRequired />
      </div>
    </div>
    <Dialog.Footer>
      <Dialog.Close class={buttonVariants({ variant: "outline" })}
        >Cancel</Dialog.Close
      >
      <Button type="submit">Save changes</Button>
    </Dialog.Footer>

    <Dialog.Root bind:open={checkDialogState}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Check</Dialog.Title>
        </Dialog.Header>
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum nemo
          corporis architecto consequuntur est eligendi sapiente nam alias, nisi
          magni, vitae quam expedita? Nobis ullam, ipsum hic minima quae quidem?
        </div>
        <Dialog.Footer>
          <Dialog.Close class={buttonVariants({ variant: "outline" })}
            >Cancel</Dialog.Close
          >
          <Button type="submit">Save changes</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  </Dialog.Content>
</Dialog.Root>
