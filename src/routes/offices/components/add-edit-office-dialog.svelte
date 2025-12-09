<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Textarea } from "$lib/components/ui/textarea";
  import { getOfficeContext } from "../context.svelte";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import { useDebounce } from "runed";
  import { apiFetch } from "$lib/utils";
  import { untrack } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { cubicIn, cubicOut } from "svelte/easing";
  import { toast } from "svelte-sonner";

  const context = getOfficeContext();

  let isSaving = $state(false);
  let hasDuplicate = $state(false);
  let isChecking = $state(false);
  let hasWhiteSpace = $state(false);
  let submitBtnIsDisabled = $derived(
    isSaving || hasDuplicate || isChecking || hasWhiteSpace
  );

  let abbr = $state("");
  let title = $state("");

  async function saveNewOffice(e: SubmitEvent) {
    e.preventDefault();

    try {
      isSaving = true;
      const res = await apiFetch(`/api/office`, {
        method: "POST",
        body: JSON.stringify({
          office_abbr: abbr,
          office_title: title,
        }),
      });

      if (!res.ok) {
        toast.error("An Error while saving office");
        return;
      }

      const office_pk = ((await res.json()) as { office_pk: number }).office_pk;

      toast.success("Office Successfully Added");
      context.add({
        office_pk,
        office_abbr: abbr,
        office_title: title,
      });
      context.officeDialogState = false;
    } finally {
      isSaving = false;
    }
  }

  async function updateOffice(e: SubmitEvent) {
    e.preventDefault();
    const office_pk = context.openOffice?.office_pk;
    if (!office_pk) return;

    try {
      isSaving = true;
      const res = await apiFetch(`/api/office/update`, {
        method: "PATCH",
        body: JSON.stringify({
          office_pk,
          office_abbr: abbr,
          office_title: title,
        }),
      });

      if (!res.ok) {
        toast.error("An Error while updating office");
        return;
      }

      toast.success("Office Updated Successfully");
      context.update({
        office_pk: office_pk,
        office_abbr: abbr,
        office_title: title,
      });
      context.officeDialogState = false;
    } finally {
      isSaving = false;
    }
  }

  const runCheck = useDebounce(
    () => {
      untrack(async () => {
        isChecking = true;
        const res = await apiFetch("/api/office/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ office_abbr: abbr.replaceAll(" ", "") }),
        });

        const data = (await res.json()) as {
          office: Office | null;
        };
        isChecking = false;

        if (context.openOffice && data.office) {
          hasDuplicate = data.office.office_pk !== context.openOffice.office_pk;
          return;
        }
        hasDuplicate = !!data.office;
      });
    },
    () => 500
  );

  function resetFormAndOpenOffice() {
    abbr = "";
    title = "";
    hasDuplicate = false;
    isChecking = false;
    hasWhiteSpace = false;
    context.openOffice = null;
  }

  $effect(() => {
    context.officeDialogState;

    untrack(() => {
      if (!context.openOffice) return;
      abbr = context.openOffice.office_abbr;
      title = context.openOffice.office_title;
    });
  });
</script>

<Dialog.Root
  bind:open={context.officeDialogState}
  onOpenChangeComplete={(open) => !open && resetFormAndOpenOffice()}
>
  <Dialog.Content
    class="sm:max-w-[425px]"
    escapeKeydownBehavior={isSaving ? "ignore" : "close"}
    interactOutsideBehavior={isSaving ? "ignore" : "close"}
    disableCloseButton={isSaving}
  >
    <form
      autocomplete="off"
      onsubmit={context.openOffice ? updateOffice : saveNewOffice}
    >
      <Dialog.Header>
        <Dialog.Title>Add New Office</Dialog.Title>
        <Dialog.Description>
          Fields marked with asterisk &lpar;<span class="text-destructive"
            >*</span
          >&rpar; are required.
        </Dialog.Description>
      </Dialog.Header>
      <div class="space-y-2 pt-4">
        <div>
          <div>
            <Label for="abbr" class="leading-6 gap-0.5 "
              >Abbreviation <span class="text-destructive font-normal"
                >&ast;</span
              ></Label
            >
            <Input
              id="abbr"
              name="abbr"
              required
              bind:value={abbr}
              aria-invalid={hasDuplicate}
              oninput={() => {
                if (!abbr.trim()) {
                  hasDuplicate = false;
                  hasWhiteSpace = false;
                  return;
                }
                hasDuplicate = false;
                if (!context.openOffice) hasWhiteSpace = /\s/.test(abbr.trim());
                runCheck();
              }}
            />
          </div>

          {#if hasDuplicate || hasWhiteSpace}
            <div
              in:slide={{ duration: 250, easing: cubicIn }}
              out:slide={{ duration: 250, delay: 200, easing: cubicOut }}
            >
              <div in:fade={{ delay: 300 }} class="pt-3 pb-6">
                <Alert.Root variant="danger">
                  <AlertCircleIcon />
                  <Alert.Title>Invalid Abbreviation</Alert.Title>
                  <Alert.Description>
                    {#if hasDuplicate && hasWhiteSpace}
                      <ul class="ml-4 list-disc">
                        <li>Abbreviation can't contain spaces.</li>
                        <li>That abbreviation is already taken.</li>
                      </ul>
                    {:else if hasWhiteSpace}
                      Abbreviation can’t contain spaces. Please remove any
                      spaces and try again.
                    {:else}
                      That abbreviation is already taken. Try entering a
                      different one to add this office.
                    {/if}
                  </Alert.Description>
                </Alert.Root>
              </div>
            </div>
          {/if}
        </div>

        <div>
          <Label for="title" class="leading-6 gap-0.5"
            >Title<span class="text-destructive font-normal">&ast;</span></Label
          >
          <Textarea
            id="title"
            name="title"
            required
            bind:value={title}
            autoHeight
            autoTrim
          />
        </div>
      </div>
      <Dialog.Footer class="mt-4">
        <Dialog.Close
          type="button"
          disabled={isSaving}
          class={buttonVariants({ variant: "secondary" })}>Cancel</Dialog.Close
        >
        <Button type="submit" disabled={submitBtnIsDisabled}>
          {#if isSaving}
            <Spinner />
          {/if}
          <span>Add Office</span>
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
