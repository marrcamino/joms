<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { apiFetch, cn } from "$lib/utils";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import { onMount, tick } from "svelte";
  import HiddenInput from "./hidden-input.svelte";

  interface Props {
    required?: boolean;
    name?: string;
    noDefaultValue?: boolean;
    value?: string;
    /**
     * This will use to set trigger and content, default is `w-[413.5px]`
     * This must be a tailwind class
     * */
    width?: string;
  }

  let {
    name,
    required,
    noDefaultValue,
    value = $bindable(""),
    width = "w-[413.5px]",
  }: Props = $props();

  let categories: PositionCategory[] = $state([]);

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement | null>(null);

  const selectedValue = $derived.by(() => {
    if (value === "null") return "Uncategorized";

    return categories.find((f) => String(f.position_categ_pk) === value)
      ?.post_categ_name;
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

  onMount(async () => {
    if (!noDefaultValue) value = "null";
    const res = await apiFetch("/api/position-category");
    if (!res.ok) return;
    categories = (await res.json()) as PositionCategory[];
  });
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        {...props}
        class={cn(
          "justify-between relative min-w-[410px] w-full text-muted-foreground data-[has-value]:text-foreground",
          width
        )}
        type="button"
        role="combobox"
        variant="outline"
        aria-expanded={open}
        title={selectedValue}
        style="width: {width}px;"
        data-has-value={value !== "null" ? "" : null}
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
            onFormReset={() => (value = "null")}
          />
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class={cn("p-0", width)}>
    <Command.Root>
      <Command.Input placeholder="Search category..." />
      <Command.List>
        <Command.Empty>No category found</Command.Empty>
        <Command.Group>
          <Command.Item
            value="null"
            keywords={["uncategorized"]}
            onSelect={() => {
              value = "null";
              closeAndFocusTrigger();
            }}
          >
            <CheckIcon class={cn(value !== "null" && "text-transparent")} />
            <span class=" text-muted-foreground">Uncategorized</span>
          </Command.Item>

          {#each categories as category (category.position_categ_pk)}
            {@const officePk = String(category.position_categ_pk)}
            <Command.Item
              value={officePk}
              keywords={[category.post_categ_name]}
              onSelect={() => {
                value = officePk;
                closeAndFocusTrigger();
              }}
            >
              <CheckIcon class={cn(value !== officePk && "text-transparent")} />
              <span>
                {category.post_categ_name}
              </span>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
