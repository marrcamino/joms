<script module lang="ts">
  export type BasicInformationObjectFormData = {
    lname: string;
    fname: string;
    mname: null | string;
    extension: null;
    sex: null | 0 | 1;
    birthday: null | string;
    email: null | string;
    address: null | string;
  };
</script>

<script lang="ts">
  import { dateHelper } from "$lib/components/date/date-helper";
  import DatePicker from "$lib/components/date/date-picker.svelte";
  import HiddenInput from "$lib/components/hidden-input.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import * as Kbd from "$lib/components/ui/kbd/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { SEX_COLOR_MAP, SEX_ICON_MAP, SEX_MAP } from "$lib/constants";
  import { apiFetch, cDate, mapToOptions } from "$lib/utils";
  import type { DateValue } from "@internationalized/date";
  import { CircleAlert, Lightbulb, Minus } from "@lucide/svelte";
  import { useDebounce } from "runed";
  import { untrack } from "svelte";
  import { cubicIn, cubicOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";

  interface Props {
    contractIsRequired?: boolean;
    asContent?: boolean;
    employee?: Employee | null;
    hasDuplicate?: boolean;
  }

  let {
    contractIsRequired = $bindable(),
    hasDuplicate = $bindable(false),
    asContent,
    employee,
  }: Props = $props();

  const sexList = mapToOptions(SEX_MAP);
  const TIP_KEY = "clipboard_tip_hidden";
  const content = asContent ? "" : null;

  let sexValue = $state("");
  let lname = $state("");
  let fname = $state("");
  let mname = $state("");
  let extension = $state("");
  let email = $state("");
  let address = $state("");
  let birthday: DateValue | undefined = $state();

  let showTip = $state(false);

  $effect(() => {
    lname;
    fname;

    untrack(() => {
      contractIsRequired = lname.trim() !== "" && fname.trim() !== "";
    });
  });

  $effect(() => {
    employee;
    untrack(() => {
      if (!employee) return;
      lname = employee.lastname;
      fname = employee.firstname;
      mname = employee.middlename ?? "";
      extension = employee.extension ?? "";
      email = employee.email ?? "";
      address = employee.address ?? "";
      sexValue = employee.sex;
      if (employee.birthday) {
        birthday = cDate.toDateValue(employee.birthday);
      }
    });
  });

  const triggerContent = $derived(
    sexList.find((f) => f.value === sexValue)?.label ?? "Select Sex"
  );

  const runCheck = useDebounce(
    () => {
      untrack(async () => {
        const res = await apiFetch("/api/employee/check-duplicate", {
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
          employee: Employee | null;
        };

        if (employee && data.employee) {
          hasDuplicate =
            data.employee.employee_pk !== employee.employee_pk &&
            data.duplicate;
        } else hasDuplicate = data.duplicate;
      });
    },
    () => 500
  );

  function hideTipForever() {
    localStorage.setItem(TIP_KEY, "1");
    showTip = false;
  }

  function checkClipboardPermission() {
    navigator.permissions
      .query({ name: "clipboard-read" as PermissionName })
      .then((result) => {
        if (result.state !== "granted") {
          // user blocked clipboard -> show tip again
          localStorage.removeItem(TIP_KEY);
          showTip = true; // reactive flag to display your tip again
          return;
        }

        if (result.state !== "granted" && !localStorage.getItem(TIP_KEY)) {
          showTip = true;

          localStorage.removeItem(TIP_KEY);
        } else {
          showTip = false;
        }
      })
      .catch(() => {
        // fallback if Permissions API not supported
        localStorage.removeItem(TIP_KEY);
        showTip = true;
      });
  }
</script>

<div
  data-content={content}
  class="[&:not([data-content])]:py-4 [&:not([data-content])]:shadow [&:not([data-content])]:px-4 [&:not([data-content])]:rounded-xl [&:not([data-content])]:bg-accent/10 space-y-4 [&:not([data-content])]:mt-6 mt-2 relative [&:not([data-content])]:border"
>
  <div class="grid gap-2 [&_label]:leading-6">
    <div data-content={content} class="pb-2 data-[content]:hidden">
      <div class="text-lg uppercase">Basic Information</div>
      <div class="text-sm text-muted-foreground">
        All fields marked with asterisk &lpar;<span class="text-destructive"
          >*</span
        >&rpar; as required.
      </div>
    </div>

    <div
      class="space-y-2"
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
              class="items-start"
            >
              <Alert.Root variant="danger">
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

    <div>
      <div class="flex gap-2">
        <div class="w-full">
          <Label class="flex-col items-start gap-0">
            <span>Sex</span>
            <Select.Root type="single" bind:value={sexValue}>
              <Select.Trigger
                class="w-full [&[aria-hidden='true']_input]:translate-x-3 relative"
              >
                <div class="flex items-center gap-1">
                  {#if sexValue}
                    {@const key = Number(sexValue) as 1 | 2}
                    {@const Icon = SEX_ICON_MAP[key]}
                    <Icon class={SEX_COLOR_MAP[key]} />
                  {/if}
                  {triggerContent}
                </div>

                <HiddenInput
                  name="sex"
                  value={sexValue}
                  onFormReset={() => (sexValue = "")}
                />
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Label>Select Sex</Select.Label>
                  <Select.Item value="">
                    <Minus />
                    Unspecified
                  </Select.Item>
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
          </Label>
        </div>

        <div class="w-full">
          <Label class="flex-col items-start gap-0">
            <span>Birthday</span>
            <DatePicker
              closeOnDateSelect
              name="birthday"
              maxDate={dateHelper.getMinimumBirthDate}
              placeholder={dateHelper.getMinimumBirthDate}
              bind:value={birthday}
              onOpenChangeComplete={(open) => {
                if (open) checkClipboardPermission();
              }}
              onClipboardPirmissionGranted={(grandted) => {
                if (!grandted) return;
                hideTipForever();
              }}
            />
          </Label>
        </div>
      </div>

      {#if showTip}
        <div in:slide out:slide={{ delay: 100, duration: 200 }}>
          <div
            class="py-2"
            in:fade={{ delay: 300, duration: 200 }}
            out:fade={{ duration: 200 }}
          >
            <Item.Root variant="muted" class="mt-2 relative">
              <Item.Media variant="icon">
                <Lightbulb class="text-yellow-500" />
              </Item.Media>
              <Item.Content>
                <Item.Title>Paste Date Easily</Item.Title>
                <Item.Description class="line-clamp-4 text-wrap">
                  <div>
                    Copy a date from anywhere then press
                    <Kbd.Group>
                      <Kbd.Root>Ctrl</Kbd.Root>
                      <span>+</span>
                      <Kbd.Root>V</Kbd.Root>
                    </Kbd.Group> when the date picker is open — your copied date
                    will fill in automatically
                  </div>

                  <div class="pt-2 text-right">
                    <Button variant="ghost" size="sm" onclick={hideTipForever}
                      >Got it</Button
                    >
                  </div>
                </Item.Description>
              </Item.Content>
            </Item.Root>
          </div>
        </div>
      {/if}
    </div>

    <div>
      <Label for="email">Email</Label>
      <Input id="email" name="email" type="email" bind:value={email} />
    </div>

    <div>
      <Label for="address">Address</Label>
      <Textarea
        autoTrim
        autoHeight
        id="address"
        name="address"
        bind:value={address}
      />
    </div>
  </div>
</div>
