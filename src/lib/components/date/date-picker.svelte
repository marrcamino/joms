<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { cn } from "$lib/utils.js";
  import {
    CalendarDate,
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
    today,
  } from "@internationalized/date";
  import { CalendarIcon, X } from "@lucide/svelte/icons";
  import { onMount } from "svelte";
  import HiddenInput from "../hidden-input.svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    closeOnDateSelect?: boolean;
    required?: boolean;
    name?: string;
    maxDate?: "minimumBirthDate";
    onOpenChangeComplete?: (open: boolean) => void;
    onClipboardPirmissionGranted?: (granted: boolean) => void;
  }

  let {
    closeOnDateSelect,
    required,
    name,
    maxDate,
    onOpenChangeComplete,
    onClipboardPirmissionGranted,
  }: Props = $props();

  const df = new DateFormatter("en-US", {
    dateStyle: "long",
  });

  let value = $state<DateValue | undefined>();
  let contentRef = $state<HTMLElement | null>(null);
  let open = $state(false);

  function getMinimumBirthDate(): CalendarDate {
    const now = today(getLocalTimeZone());
    // subtract 18 years
    const minDate = now.subtract({ years: 18 });
    return minDate;
  }

  function getMinDate() {
    if (!maxDate) return undefined;

    if (maxDate === "minimumBirthDate") {
      const date = getMinimumBirthDate();
      return date;
    }
  }

  function getPlaceholderDate() {
    if (!maxDate) return undefined;

    if (maxDate === "minimumBirthDate") {
      const date = getMinimumBirthDate();
      return date;
    }
  }

  function getDateFromClipboardText(text: string): CalendarDate | undefined {
    const parsedDate = new Date(text);
    if (isNaN(parsedDate.getTime())) {
      return undefined;
    }
    return new CalendarDate(
      parsedDate.getFullYear(),
      parsedDate.getMonth() + 1,
      parsedDate.getDate()
    );
  }

  onMount(() => {
    async function handlePasteShortcut(e: KeyboardEvent) {
      if (!open) return;
      if (!(e.ctrlKey && e.key.toLowerCase() === "v")) return;

      e.preventDefault(); // optional: block default paste if needed
      try {
        const text = await navigator.clipboard.readText();

        const parsedDate = getDateFromClipboardText(text);

        if (parsedDate) {
          value = parsedDate;
          open = false;
          onClipboardPirmissionGranted?.(true);
          return;
        }

        toast.error("Invalid date", {
          description: "The date you copied is invalid.",
        });
      } catch (err) {
        toast.error("Clipboard access blocked", {
          description: "Enable clipboard permission in your browser.",
        });
      }
    }

    document.addEventListener("keydown", handlePasteShortcut);

    return () => {
      document.removeEventListener("keydown", handlePasteShortcut);
    };
  });

  // toast.error("Title here", {
  //   description: "Description here",
  // });
</script>

<Popover.Root
  bind:open
  onOpenChangeComplete={() => onOpenChangeComplete?.(open)}
>
  <Popover.Trigger
    class={cn(
      buttonVariants({
        variant: "outline",
        class: "w-[280px] justify-start text-left font-normal relative",
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

    {#if name}
      <HiddenInput
        bind:required
        bind:name
        {value}
        onFormReset={() => {
          value = undefined;
        }}
      />
    {/if}
  </Popover.Trigger>

  <Popover.Content bind:ref={contentRef} class="w-auto p-0">
    <Calendar
      onValueChange={(value) => {
        if (value && closeOnDateSelect) open = false;
      }}
      type="single"
      bind:value
      class="rounded-md border shadow-sm"
      captionLayout="dropdown"
      placeholder={getPlaceholderDate()}
      maxValue={getMinDate()}
    />
  </Popover.Content>
</Popover.Root>
