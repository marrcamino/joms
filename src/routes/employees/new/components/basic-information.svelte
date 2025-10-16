<script lang="ts">
  import { SEX_COLOR_MAP } from "$lib/colors.const";
  import DatePicker from "$lib/components/date/date-picker.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Spinner } from "$lib/components/ui/spinner/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { SEX_MAP } from "$lib/constant";
  import { SEX_ICON_MAP } from "$lib/icons.const";
  import { mapToOptions } from "$lib/utils";
  import { Save, CircleAlert } from "@lucide/svelte";
  import { useDebounce } from "runed";
  import { untrack } from "svelte";
  import { cubicIn, cubicOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";

  const sexList = mapToOptions(SEX_MAP);

  let isSaving = $state(false);
  let sexValue = $state("");
  let lname = $state("");
  let fname = $state("");
  let mname = $state("");
  let extension = $state("");

  let hasDuplicate = $state(false);

  const triggerContent = $derived(
    sexList.find((f) => f.value === sexValue)?.label ?? "Select Sex"
  );

  const runCheck = useDebounce(
    () => {
      untrack(async () => {
        const res = await fetch(`${BASE_URL}api/employee/check-duplicate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastname: lname,
            firstname: fname,
            middlename: mname,
            extension: extension.replaceAll(".", ""),
          }),
        });

        const data = (await res.json()) as {
          duplicate: boolean;
          message: string;
        };
        hasDuplicate = data.duplicate;
      });
    },
    () => 500
  );
</script>

<div class="py-4 shadow border px-4 rounded-xl bg-accent/10 space-y-4">
  <div class="grid gap-2 [&_label]:leading-6">
    <div class="pb-2">
      <div class="text-lg uppercase">Basic Information</div>
      <div class="text-sm text-muted-foreground">
        All required fields are marked with asterisk
      </div>
    </div>

    <div
      class="grid gap-2"
      oninput={(e) => {
        if (!lname.trim() && !fname.trim()) return;
        if (!(e.target instanceof HTMLInputElement)) return;

        hasDuplicate = false;
        runCheck();
      }}
    >
      <div>
        <Label for="lname" aria-required>Last Name</Label>
        <Input
          required
          id="lname"
          name="lname"
          bind:value={lname}
          aria-invalid={hasDuplicate}
        />
      </div>
      <div>
        <Label for="fname" aria-required>First Name</Label>
        <Input
          required
          id="fname"
          name="fname"
          bind:value={fname}
          aria-invalid={hasDuplicate}
        />
      </div>
      <div>
        <Label for="mname">Middle Name</Label>
        <Input
          id="mname"
          name="mname"
          bind:value={mname}
          aria-invalid={hasDuplicate}
        />
      </div>
      <div>
        <div>
          <Label for="extension">Extension</Label>
          <Input
            id="extension"
            name="extension"
            bind:value={extension}
            aria-invalid={hasDuplicate}
          />
        </div>

        {#if hasDuplicate}
          <div
            class="pt-4"
            in:slide={{ duration: 250, easing: cubicIn }}
            out:slide={{ duration: 250, delay: 200, easing: cubicOut }}
          >
            <div
              in:fade={{ delay: 300, duration: 200 }}
              out:fade={{ duration: 200 }}
              class="grid w-full max-w-xl items-start gap-4"
            >
              <Alert.Root variant="destructive">
                <CircleAlert />
                <Alert.Title>Duplicate Employee Detected</Alert.Title>
                <Alert.Description>
                  <p>
                    An employee with the same name already exists in the system.
                  </p>
                  <ul class="list-inside list-disc text-sm">
                    <li>Check if this employee is already registered</li>
                    <li>Ensure spelling of names are correct</li>
                    <li>
                      For a different person, add middle name or extension
                    </li>
                  </ul>
                </Alert.Description>
              </Alert.Root>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex gap-2">
      <div class="w-full">
        <Label class="flex-col items-start gap-0" for="sex-select">
          <div>Sex <span class="text-red-600">*</span></div>
        </Label>
        <Select.Root type="single" bind:value={sexValue} required name="sex">
          <Select.Trigger
            class="w-full [&[aria-hidden='true']_input]:translate-x-3"
            id="sex-select"
          >
            <div class="flex items-center gap-1">
              {#if sexValue}
                {@const key = Number(sexValue) as 1 | 2}
                {@const Icon = SEX_ICON_MAP[key]}
                <Icon class={SEX_COLOR_MAP[key]} />
              {/if}
              {triggerContent}
            </div>
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Label>Sex</Select.Label>
              {#each sexList as sex (sex.value)}
                {@const key = Number(sex.value) as 1 | 2}
                {@const Icon = SEX_ICON_MAP[key]}

                <Select.Item value={sex.value} label={sex.label}>
                  <Icon class={SEX_COLOR_MAP[key]} />
                  {sex.label}
                </Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </div>

      <div>
        <Label class="flex-col items-start gap-0">
          <div>Birthday <span class="text-red-600">*</span></div>
        </Label>
        <DatePicker closeOnDateSelect required name="birthday" />
      </div>
    </div>

    <div>
      <Label for="email">Email</Label>
      <Input id="email" name="email" type="email" />
    </div>

    <div>
      <Label for="address">Address</Label>
      <Textarea id="address" name="address" />
    </div>
  </div>
</div>

<div class="mt-4 text-right">
  <Button type="submit" disabled={isSaving || hasDuplicate}>
    {#if isSaving}
      <Spinner />
      <span>Saving...</span>
    {:else}
      <Save />
      <span>Add Employee</span>
    {/if}
  </Button>
</div>
