<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Item from "$lib/components/ui/item/index.js";
  import * as Kbd from "$lib/components/ui/kbd/index.js";
  import { Textarea } from "$lib/components/ui/textarea";
  import { apiFetch } from "$lib/utils";
  import { untrack } from "svelte";
  import { fade, slide } from "svelte/transition";

  interface Props {
    value?: string;
    employeePk: string;
    isFocus?: boolean;
    onClickUse?: (contract: Contract) => void;
  }

  let {
    value = $bindable(""),
    employeePk,
    onClickUse,
    isFocus = $bindable(false),
  }: Props = $props();

  let usedAutoFill = false;
  let contract: Contract | null = $state(null);
  let showSuggestion = $derived(contract && isFocus && !value.trim());
  let showTip = $state(true);
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    employeePk;
    untrack(async () => {
      if (!employeePk.trim()) {
        contract = null;
        return;
      }
      const res = await apiFetch(
        `/api/employee/contract/latest?employee_fk=${employeePk}`
      );

      if (!res.ok) return;

      const data = ((await res.json()) as { data: Contract | null }).data;

      if (data && contract && usedAutoFill) {
        onClickUse?.(data);
        value = data.designation;
        showTip = true;
        return;
      }
      contract = data;
    });
  });

  function onKeydown(e: KeyboardEvent) {
    if (!showTip) return;
    if (!contract || (isFocus && value)) return;

    if (e.key === "Tab") {
      if (!(showSuggestion && showTip && !value)) return;
      e.preventDefault();
      value = contract.designation;
      isFocus = false;
      usedAutoFill = true;
      onClickUse?.(contract!);
    }

    if (e.key === "Escape") {
      showTip = false;
    }
  }
</script>

<div class="relative">
  <Textarea
    required
    id="designation"
    bind:value
    onkeydown={onKeydown}
    onfocusin={() => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      isFocus = true;
    }}
    onfocusout={() => {
      hideTimer = setTimeout(() => {
        isFocus = false;
        hideTimer = null;
      }, 1000);
    }}
  />

  {#if showSuggestion && showTip && !value}
    <div
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 100 }}
      class="text-sm rounded-md px-2 py-0.5 bg-background absolute top-2 left-4"
    >
      Hit <span class="text-muted-foreground">tab</span> to autofill
    </div>
  {/if}
  {#if showSuggestion}
    <div in:slide class="pt-2 pb-6" out:slide={{ delay: 200 }}>
      <div in:fade={{ delay: 200 }} out:fade>
        <Item.Root variant="outline">
          <Item.Content>
            <Item.Title>Previous designation</Item.Title>
            <Item.Description class="text-wrap line-clamp-none">
              "{contract!.designation}". Hit <Kbd.Root>Tab</Kbd.Root> or Click use
              to autofill.
            </Item.Description>
          </Item.Content>
          <Item.Actions>
            <Button
              variant="outline"
              size="sm"
              onclick={() => {
                value = contract?.designation || "";
                onClickUse?.(contract!);
                usedAutoFill = true;
              }}>Use</Button
            >
          </Item.Actions>
        </Item.Root>
      </div>
    </div>
  {/if}
</div>
