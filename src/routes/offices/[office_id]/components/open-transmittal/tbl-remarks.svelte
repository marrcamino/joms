<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { apiFetch } from "$lib/utils";
  import { Pencil } from "@lucide/svelte";
  import { onMount, untrack } from "svelte";
  import { getOfficeAllTransmittalContext } from "../../context.svelte";

  interface Props {
    transmittal: null | Transmittal;
  }

  let { transmittal }: Props = $props();
  let value = $state("");
  let open = $state(false);
  let remarks: null | string = $state("");
  let saving = $state(false);

  const officeAllTransCtx = getOfficeAllTransmittalContext();

  $effect(() => {
    if (open) untrack(() => (value = String(remarks)));
  });

  async function saveRemarks() {
    try {
      saving = true;
      if (!transmittal) {
        console.error("Can't update remark, no transmittal in the context");
        return;
      }

      const res = await apiFetch(
        `/api/transmittal?transmittal_pk=${transmittal.transmittal_pk}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            transmittal_pk: transmittal.transmittal_pk,
            remarks: remarks ? remarks.trim() : null,
          }),
        }
      );

      if (!res.ok) {
        console.error("Naay error sa pag save sa remarks: ", await res.json());
        return;
      }
      officeAllTransCtx.updateTransmittal({
        transmittal_pk: transmittal.transmittal_pk,
        remarks: remarks ? remarks.trim() : null,
      });
      open = false;
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    if (transmittal?.remarks) {
      remarks = transmittal.remarks;
    }
  });
</script>

<div class="flex items-center gap-1">
  <span>Remarks</span>

  <Dialog.Root bind:open>
    <Dialog.Trigger
      class={buttonVariants({ variant: "secondary", size: "xs" })}
    >
      <Pencil />
      Edit</Dialog.Trigger
    >
    <Dialog.Content
      class="sm:max-w-[425px]"
      escapeKeydownBehavior={saving ? "ignore" : "close"}
      interactOutsideBehavior={saving ? "ignore" : "close"}
    >
      <Dialog.Header>
        <Dialog.Title>Edit Remarks</Dialog.Title>
      </Dialog.Header>
      <div>
        <div class="relative">
          <Textarea
            class="pb-8"
            placeholder="Enter remarks here"
            spellcheck="false"
            autoTrim
            autoHeight
            bind:value
          />

          <Button
            size="xs"
            variant="secondary"
            class="absolute bottom-1.5 right-1.5"
            onclick={() => (value = "")}>Clear</Button
          >
        </div>
      </div>
      <Dialog.Footer>
        <Dialog.Close
          disabled={saving}
          class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close
        >
        <Button
          disabled={saving}
          onclick={() => {
            remarks = value.replace(/\s+/g, " ").trim() ?? null;
            saveRemarks();
          }}
        >
          {#if saving}
            <Spinner />
            Saving...
          {:else}
            Save changes
          {/if}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
<div class="text-muted-foreground">
  <div class="">
    {#if remarks}
      {remarks}
    {:else}
      <span class="italic">None</span>
    {/if}
  </div>
</div>
