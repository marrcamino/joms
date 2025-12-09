<script lang="ts" module>
  import { getContext, setContext } from "svelte";

  const CONTEXT_KEY = Symbol("pickEmployeesContextKey");

  function createContext() {
    let selectedTransmittal: Transmittal | undefined = $state();
    let ids = $derived(new SvelteSet<number>());
    let lastId: string | null = null;
    let emps: TransmittalContractItems[] = $state([]);
    let pickedEms: TransmittalContractItems[] = $state([]);

    return {
      get ids() {
        return ids;
      },
      get selectedTransmittal() {
        return selectedTransmittal;
      },
      get lastId() {
        return lastId;
      },
      get emps() {
        return emps;
      },
      get pickedEms() {
        return pickedEms;
      },

      set ids(value: SvelteSet<number>) {
        ids = value;
      },
      set lastId(value: string | null) {
        lastId = value;
      },
      set selectedTransmittal(value: Transmittal | undefined) {
        selectedTransmittal = value;
      },
      set emps(value: TransmittalContractItems[]) {
        emps = value;
      },
      set pickedEms(value: TransmittalContractItems[]) {
        pickedEms = value;
      },
    };
  }

  export function setPickEmpContext() {
    return setContext(CONTEXT_KEY, createContext());
  }

  export function getPickEmpContext() {
    return getContext(CONTEXT_KEY) as ReturnType<typeof createContext>;
  }
</script>

<script lang="ts">
  import AnimateContent from "$lib/components/animate-content.svelte";
  import DateDisplay from "$lib/components/display/date-display.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import type { TransmittalContractItems } from "$lib/types";
  import { apiFetch, formatFullName } from "$lib/utils";
  import { CalendarRange, CircleAlert, Landmark, Info } from "@lucide/svelte";
  import { onMount, untrack } from "svelte";
  import { quartIn } from "svelte/easing";
  import { SvelteSet } from "svelte/reactivity";
  import { slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";

  const WIDTHS = [100, 130, 150, 180, 200];
  const pickEmpsContext = getPickEmpContext();

  async function getData() {
    if (!pickEmpsContext.selectedTransmittal) return;
    const res = await apiFetch(
      `/api/view/transmittal-items?transmittal_pk=${pickEmpsContext.selectedTransmittal.transmittal_pk}`
    );
    if (!res.ok) {
      return;
    }
    pickEmpsContext.emps = (await res.json()) as TransmittalContractItems[];
  }

  $effect(() => {
    pickEmpsContext.ids.size;
    untrack(() => {
      pickEmpsContext.pickedEms = $state.snapshot(
        pickEmpsContext.emps.filter((e) =>
          pickEmpsContext.ids.has(e.employee_pk)
        )
      );
    });
  });

  onMount(async () => {
    if (!pickEmpsContext.selectedTransmittal) return;
    const transmittal_pk =
      pickEmpsContext.selectedTransmittal.transmittal_pk.toString();

    if (pickEmpsContext.lastId === transmittal_pk) return;
    // console.log("dfdfg");

    pickEmpsContext.lastId = transmittal_pk;
    await getData();
    pickEmpsContext.ids = new SvelteSet(
      pickEmpsContext.emps.map((i) => i.employee_pk)
    );
  });
</script>

<div class="text-sm">
  <div class="pl-1">
    <div>
      <div class="text-muted-foreground leading-3.5">
        Selected transmittal details
      </div>
      <div
        class="flex mb-1 items-center gap-1 [&_svg]:size-3 [&_svg]:text-muted-foreground"
      >
        <CalendarRange />
        <DateDisplay
          class="min-w-[136px]"
          date={{
            start_date: pickEmpsContext.selectedTransmittal?.start_date ?? "",
            end_date: pickEmpsContext.selectedTransmittal?.end_date ?? "",
          }}
        />
        <Landmark class="ml-2" />
        <span style="min-width: 36px;"
          >{pickEmpsContext.selectedTransmittal?.funding_charge}</span
        >
      </div>
    </div>

    <div class="pt-4 pb-1">
      <div class="flex leading-4 w-max text-muted-foreground">
        Select one or more employees from the list below
      </div>
    </div>
  </div>
  <ScrollArea viewPortClasses="max-h-[200px]" type="always">
    <div class="space-y-1 py-1">
      <div class="flex items-center gap-2 pl-1">
        <Checkbox
          id="e_all"
          checked={pickEmpsContext.ids.size === pickEmpsContext.emps.length}
          onCheckedChange={(v) => {
            if (v) {
              pickEmpsContext.ids = new SvelteSet(
                pickEmpsContext.emps.map((i) => i.employee_pk)
              );
            } else pickEmpsContext.ids.clear();
          }}
        />
        <Label for="e_all" class="text-muted-foreground font-normal"
          >{pickEmpsContext.ids.size === pickEmpsContext.emps.length
            ? "Des"
            : "S"}elect All</Label
        >
      </div>
      {#if pickEmpsContext.emps.length}
        <div
          in:slide={{ easing: quartIn, delay: 500 }}
          data-invalid={!pickEmpsContext.ids.size ? "" : null}
          class="group"
        >
          {#each pickEmpsContext.emps as contract (contract.employee_pk)}
            <div class="flex items-center gap-2 py-0.5 pl-1">
              <Checkbox
                class="group-data-invalid:ring-destructive/40 group-data-invalid:border-destructive group-data-invalid:dark:aria-invalid:ring-destructive/40"
                id="e_{contract.employee_pk}"
                checked={pickEmpsContext.ids.has(contract.employee_pk)}
                onCheckedChange={(v) => {
                  if (v) {
                    pickEmpsContext.ids.add(contract.employee_pk);
                    return;
                  }
                  pickEmpsContext.ids.delete(contract.employee_pk);
                }}
              />
              <Label for="e_{contract.employee_pk}" class="font-normal">
                {formatFullName({ ...contract })}</Label
              >
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </ScrollArea>
  <div class="text-muted-foreground text-xs pl-1">
    Selected {pickEmpsContext.ids.size}
  </div>

  <div class="px-0.5">
    {#if !pickEmpsContext.ids.size}
      <AnimateContent outerAnimationDuration={250} innerDelay={550}>
        <div class="pt-1">
          <Alert.Root variant="danger">
            <CircleAlert />
            <Alert.Title class="font-normal">
              You must pick at least one employee to proceed
            </Alert.Title>
          </Alert.Root>
        </div>
      </AnimateContent>
    {/if}

    <Alert.Root variant="info" class="mt-1" hidden>
      <Info />
      <Alert.Title class="font-normal">
        <span class="font-semibold">Note:</span> You can add another employee
        later
        <Button class="float-end" size="xs" variant="outline">Close</Button>
      </Alert.Title>
    </Alert.Root>
  </div>
</div>
