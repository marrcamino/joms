<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { cn } from "$lib/utils";
  import { getOfficeContext } from "$routes/offices/context.svelte";
  import { CheckIcon, ChevronsUpDownIcon, X } from "@lucide/svelte";
  import { tick } from "svelte";
  import HiddenInput from "./hidden-input.svelte";

  interface Props {
    required?: boolean;
    name?: string;
    value?: string;
    /**
     * This will use to set trigger and content, default is `w-[413.5px]`
     * This must be a tailwind class
     * */
    width?: string;
    allowNoOffice?: boolean;
  }

  let {
    name,
    required,
    value = $bindable(""),
    width = "w-[413.5px]",
    allowNoOffice,
  }: Props = $props();

  const officeContext = getOfficeContext();

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement | null>(null);

  const selectedValue = $derived.by(() => {
    if (!allowNoOffice) {
      return officeContext.offices.find((f) => String(f.office_pk) === value)
        ?.office_title;
    }

    const theValue = officeContext.offices.find(
      (f) => String(f.office_pk) === value,
    )?.office_title;

    return theValue ?? "No Office (Not in agency)";
  });

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef?.focus();
    });
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        {...props}
        data-has-value={selectedValue ? "" : null}
        class={cn(
          "justify-between relative text-muted-foreground data-[has-value]:text-foreground pl-2.5 pr-6.5",
          width,
        )}
        type="button"
        role="combobox"
        variant="outline"
        aria-expanded={open}
        title={selectedValue}
      >
        <span class="truncate">
          {selectedValue || "Select office..."}
        </span>

        <button
          title="Clear Office"
          type="button"
          data-clickable={value ? "" : null}
          class="absolute right-2 top-2 text-muted-foreground hover:text-foreground data-clickable:pointer-events-auto pointer-events-none"
          onclick={(e) => {
            e.stopPropagation();
            value = "";
          }}
        >
          {#if value}
            <X />
          {:else}
            <ChevronsUpDownIcon class="opacity-50" />
          {/if}
        </button>

        {#if name}
          <HiddenInput
            {name}
            {required}
            {value}
            onFormReset={() => (value = "")}
          />
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class={cn("p-0", width)}>
    <Command.Root>
      <Command.Input placeholder="Search office..." />
      <Command.List>
        <Command.Empty>No office found</Command.Empty>

        <Command.Group>
          {#if allowNoOffice}
            <Command.Item
              value=""
              keywords={[""]}
              onSelect={() => {
                value = "";
                closeAndFocusTrigger();
              }}
            >
              <CheckIcon class={cn(value !== "" && "text-transparent")} />
              <span class="italic pl-0.5 text-yellow-600"
                >No Office &lpar;Not in agency&rpar;</span
              >
            </Command.Item>
          {/if}
          {#each officeContext.offices as office (office.office_pk)}
            {@const officePk = String(office.office_pk)}
            <Command.Item
              value={officePk}
              keywords={[office.office_abbr, office.office_title]}
              onSelect={() => {
                value = officePk;
                closeAndFocusTrigger();
              }}
            >
              <CheckIcon class={cn(value !== officePk && "text-transparent")} />
              <span>
                {office.office_title}
                <Badge variant="outline">{office.office_abbr}</Badge>
              </span>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
