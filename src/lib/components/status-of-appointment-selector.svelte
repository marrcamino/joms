<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import { cn } from "$lib/utils";
  import type { ClassValue } from "svelte/elements";
  import HiddenInput from "./hidden-input.svelte";
  import { Badge } from "$lib/components/ui/badge/index.js";

  interface Props {
    value?: string;
    triggerClass?: ClassValue | null;
    required?: boolean;
    name?: string;
  }

  let {
    value = $bindable("1"),
    triggerClass,
    name,
    required,
  }: Props = $props();

  const appointmentTypes = [
    { value: "1", label: "Job Order", abbr: "JO" },
    { value: "2", label: "Contract of Service", abbr: "COS" },
  ];

  const triggerContent = $derived(
    appointmentTypes.find((f) => f.value === value)?.label ?? "Select type"
  );
</script>

<Select.Root type="single" bind:value>
  <Select.Trigger class={cn("w-full relative", triggerClass)}>
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
