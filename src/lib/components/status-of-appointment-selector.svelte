<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    APPOINTMENT_STATUS_ABBR_MAP,
    APPOINTMENT_STATUS_MAP,
  } from "$lib/constants";
  import { cn, mapToOptionsWithAbbr } from "$lib/utils";
  import type { Booleanish, ClassValue } from "svelte/elements";
  import HiddenInput from "./hidden-input.svelte";
  import type { ComponentProps } from "svelte";

  interface Props {
    disabled?: boolean;
    value?: string;
    required?: boolean;
    name?: string;
    open?: boolean;
    onValueChange?: (val: string) => void;
  }

  let {
    value = $bindable("1"),
    class: triggerClass,
    name,
    required,
    disabled,
    ref = $bindable(null),
    open = $bindable(false),
    onValueChange,
    ...restProps
  }: Props & ComponentProps<typeof Select.Trigger> = $props();

  const appointmentTypes = mapToOptionsWithAbbr(
    APPOINTMENT_STATUS_MAP,
    APPOINTMENT_STATUS_ABBR_MAP,
  );

  const triggerContent = $derived(
    appointmentTypes.find((f) => f.value === value)?.label ?? "Select status",
  );
</script>

<Select.Root type="single" bind:value {disabled} bind:open {onValueChange}>
  <Select.Trigger
    bind:ref
    class={cn("w-full relative", triggerClass)}
    {disabled}
    {...restProps}
  >
    {triggerContent}
    {#if name}
      <HiddenInput {name} {required} {value} onFormReset={() => (value = "")} />
    {/if}
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      {#each appointmentTypes as appointmentType (appointmentType.value)}
        <Select.Item
          value={appointmentType.value}
          label={appointmentType.label}
        >
          {appointmentType.label}
          <Badge variant="outline">{appointmentType.abbr}</Badge>
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
