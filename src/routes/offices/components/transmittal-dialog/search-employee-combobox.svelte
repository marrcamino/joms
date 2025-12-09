<script lang="ts">
  import HiddenInput from "$lib/components/hidden-input.svelte";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { apiFetch, cn, formatFullName } from "$lib/utils";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import { useDebounce } from "runed";
  import { tick, untrack } from "svelte";
  import { getDraftTransmittalContext } from "./context.svelte";

  interface Props {
    value?: string;
    required?: boolean;
    name?: string;
    employee: null | Employee;
    isSearching?: boolean;
    disabled?: boolean;
  }

  let {
    value = $bindable(""),
    name,
    required,
    employee = $bindable(null),
    isSearching = $bindable(false),
    disabled,
  }: Props = $props();

  const context = getDraftTransmittalContext();
  let listOfEmployees: Employee[] = $state([]);
  let open = $state(false);
  let searchValue = $state("");
  let triggerRef = $state<HTMLButtonElement>(null!);

  const selectedValue = $derived(
    listOfEmployees.find((e) => String(e.employee_pk) === value)
  );

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }

  $effect(() => {
    searchValue;
    untrack(runCheck);
  });

  $effect(() => {
    context.addEmpDialogState;

    //Setting fields when edting mode
    untrack(async () => {
      if (!context.addEmpDialogState || !context.empTranToEdit) return;
      const et = context.empTranToEdit;

      const res = await apiFetch(`/api/employee?employee_pk=${et.employee_fk}`);

      if (!res.ok) return;

      const emp = (await res.json()) as Employee | null;

      if (emp) {
        employee = emp;
        value = String(et.employee_fk);
        listOfEmployees = [emp];
      }
    });
  });

  const runCheck = useDebounce(
    () => {
      untrack(async () => {
        if (!searchValue.trim()) return;
        isSearching = true;
        listOfEmployees = [];

        const res = await apiFetch(
          `/api/employee/search?q=${searchValue.trim()}`
        );

        if (!res.ok) {
          isSearching = false;
          return;
        }
        const data = (
          (await res.json()) as {
            data: Employee[];
          }
        ).data;

        isSearching = false;
        listOfEmployees = data;
      });
    },
    () => 500
  );
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        class="w-full justify-between relative"
        role="combobox"
        aria-expanded={open}
        {disabled}
      >
        {#if selectedValue}
          {formatFullName(selectedValue)}
        {:else}
          Select an employee...
        {/if}

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
  <Popover.Content class="w-[373px] p-0">
    <Command.Root shouldFilter={false}>
      <Command.Input placeholder="Type to search..." bind:value={searchValue} />
      {#if isSearching}
        <div class="absolute top-2.5 left-3 bg-popover">
          <Spinner />
        </div>
      {/if}
      <Command.List>
        <Command.Empty>
          {#if searchValue && isSearching}
            Searching...
          {:else if !searchValue.trim() && !isSearching}
            Start typing to search
          {:else}
            No employees found.
          {/if}
        </Command.Empty>
        <Command.Group>
          {#each listOfEmployees as emp (emp.employee_pk)}
            {@const isAdded = context.employeeIds.has(emp.employee_pk)}
            <Command.Item
              disabled={isAdded}
              value={String(emp.employee_pk)}
              keywords={[
                emp.lastname,
                emp.firstname,
                emp.middlename ?? "",
                emp.extension ?? "",
              ]}
              onSelect={() => {
                value = String(emp.employee_pk);
                employee = emp;
                closeAndFocusTrigger();
              }}
            >
              <CheckIcon
                class={cn(
                  value !== String(emp.employee_pk) && "text-transparent"
                )}
              />
              {formatFullName(emp)}

              {#if isAdded}
                <Badge variant="outline-constructive">Added</Badge>
              {/if}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
