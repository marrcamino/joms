<script lang="ts">
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { MessageSquareWarning } from "@lucide/svelte";
  import { onMount } from "svelte";
  import AnimateContent from "../animate-content.svelte";
  import { Button } from "../ui/button";

  const STORAGE_KEY = "service-impact-notice-dismissed-at";
  const THREE_MONTHS_MS = 1000 * 60 * 60 * 24 * 90;

  let visible = $state(false);

  function checkVisibility() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      visible = true;
      return;
    }

    const dismissedAt = Number(stored);
    const now = Date.now();

    visible = now - dismissedAt > THREE_MONTHS_MS;
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    visible = false;
  }

  onMount(() => checkVisibility());
</script>

{#if visible}
  <AnimateContent innerDelay={600}>
    <div class="pb-6">
      <Alert.Root variant="warning">
        <MessageSquareWarning />
        <Alert.Title>Important Notice</Alert.Title>
        <Alert.Description>
          <div>
            Every PDS record entered into the system will automatically be
            included in the employee’s length of service calculation.
          </div>
          <div>
            Please ensure that the record represents valid and official service.
            Do not enter records that should not be counted.
          </div>

          <div class="flex w-full">
            <Button
              type="button"
              onclick={dismiss}
              size="sm"
              variant="outline"
              class="ml-auto">Got it, Dismiss</Button
            >
          </div>
        </Alert.Description>
      </Alert.Root>
    </div>
  </AnimateContent>
{/if}
