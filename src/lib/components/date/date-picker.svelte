<script lang="ts">
  import { CalendarIcon, X } from "@lucide/svelte/icons";
  import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from "@internationalized/date";
  import { cn } from "$lib/utils.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import HiddenInput from "../hidden-input.svelte";

  interface Props {
    closeOnDateSelect?: boolean;
    required?: boolean;
    name?: string;
  }

  let { closeOnDateSelect, required, name }: Props = $props();

  const df = new DateFormatter("en-US", {
    dateStyle: "long",
  });

  let value = $state<DateValue | undefined>();
  let contentRef = $state<HTMLElement | null>(null);
  let open = $state(false);
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class={cn(
      buttonVariants({
        variant: "outline",
        class: "w-[280px] justify-start text-left font-normal ",
      }),
      !value && "text-muted-foreground"
    )}
  >
    <CalendarIcon />
    {value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date"}

    <button
      data-has-date={value ? "" : null}
      class="absolute right-2 data-[has-date]:pointer-events-auto pointer-events-none transition-opacity data-[has-date]:opacity-100 opacity-0"
      type="button"
      onclick={(e) => {
        e.stopPropagation();
        value = undefined;
      }}><X /> <span class="sr-only">clear date</span></button
    >
  </Popover.Trigger>
  <input
    {required}
    {name}
    aria-hidden="true"
    tabindex="-1"
    autocomplete="off"
    style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px; "
  />
  <Popover.Content bind:ref={contentRef} class="w-auto p-0">
    <Calendar
      onValueChange={(value) => {
        if (value && closeOnDateSelect) open = false;
      }}
      type="single"
      bind:value
      class="rounded-md border shadow-sm"
      captionLayout="dropdown"
    />
  </Popover.Content>
</Popover.Root>
