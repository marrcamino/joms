<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { cn } from "$lib/utils";
  import { getOfficeContext } from "$routes/offices/context.svelte";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import { tick } from "svelte";
  import HiddenInput from "./hidden-input.svelte";

  interface Props {
    required?: boolean;
    name?: string;
    value?: string;
  }

  let { name, required, value = $bindable("") }: Props = $props();

  const officeContext = getOfficeContext();

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement | null>(null);

  const selectedValue = $derived(
    officeContext.offices.find((f) => String(f.office_pk) === value)
      ?.office_title
  );
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
        class="justify-between relative w-[440px] text-muted-foreground data-[has-value]:text-foreground"
        type="button"
        role="combobox"
        variant="outline"
        aria-expanded={open}
        title={selectedValue}
      >
        <span class="truncate">
          {selectedValue || "Select office..."}
        </span>
        <ChevronsUpDownIcon class="opacity-50" />

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
  <Popover.Content class="p-0 w-[440px]">
    <Command.Root>
      <Command.Input placeholder="Search office..." />
      <Command.List>
        <Command.Empty>No office found</Command.Empty>
        <Command.Group>
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
              </span>
              <Badge>{office.office_abbr}</Badge>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
