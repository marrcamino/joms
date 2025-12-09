<script lang="ts">
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Spinner } from "$lib/components/ui/spinner";
  import { apiFetch } from "$lib/utils";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import { toast } from "svelte-sonner";
  import { fade, slide } from "svelte/transition";
  import { getOfficeContext } from "../context.svelte";
  import ContractHoverInfo from "./contract-hover-info/contract-hover-info.svelte";

  type DeleteResponse = {
    contracts: Contract[];
  };
  type GroupedContracts = {
    employee_fk: number;
    contracts: Contract[];
  };

  const context = getOfficeContext();

  let isDeleting = $state(false);
  let empContracts: null | GroupedContracts[] = $state(null);
  let numOfContracts = $state(0);

  async function onclick() {
    const id = context.openOffice?.office_pk;
    if (!id) return;

    try {
      isDeleting = true;
      const res = await apiFetch(`/api/office?office_pk=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("An error while deleting office", {
          description: "Please try again",
        });
        return;
      }

      const data = ((await res.json()) as DeleteResponse).contracts;
      if (data.length) {
        empContracts = groupContractsByEmployee(data);
        numOfContracts = data.length;
        return;
      }

      context.openOffice = null;
      context.remove(id);
      context.deleteDialogState = false;

      isDeleting = false;
      toast.success("Office deleted succesfully");
    } finally {
      isDeleting = false;
    }
  }

  function groupContractsByEmployee(contracts: Contract[]): GroupedContracts[] {
    const map = new Map<number, Contract[]>();

    for (const c of contracts) {
      if (!map.has(c.employee_fk)) {
        map.set(c.employee_fk, []);
      }
      map.get(c.employee_fk)!.push(c);
    }

    return Array.from(map.entries()).map(([employee_fk, contracts]) => ({
      employee_fk,
      contracts,
    }));
  }

  function reset(open: boolean) {
    if (open) return;
    empContracts = null;
    numOfContracts = 0;
    context.openOffice = null;
  }
</script>

<Dialog.Root bind:open={context.deleteDialogState} onOpenChangeComplete={reset}>
  <Dialog.Content
    showCloseButton={false}
    interactOutsideBehavior="ignore"
    class="px-0"
  >
    <Dialog.Header class="px-6">
      <Dialog.Title>Delete Office?</Dialog.Title>
    </Dialog.Header>

    <div>
      {#if !empContracts}
        <div class="px-6 text-muted-foreground leading-5 pb-4" transition:slide>
          Are you sure you want to delete the office <span class="font-semibold"
            >{context.openOffice?.office_abbr}</span
          >? This action cannot be undone.
        </div>
      {/if}
      {#if empContracts}
        <div transition:slide>
          <div class="px-6" in:fade={{ delay: 300 }}>
            <Alert.Root variant="destructive">
              <AlertCircleIcon />
              <Alert.Title>Office Can’t Be Deleted</Alert.Title>
              <Alert.Description>
                This office is still linked to contracts. If you want to remove
                it, you’ll need to reassign those contracts first. The linked
                contracts are listed below.
              </Alert.Description>
            </Alert.Root>
          </div>
          <div in:fade={{ delay: 300 }}>
            <div class="mt-4 text-lg px-4">
              <span class="text-foreground">List of linked contracts</span>
              <span class="text-muted-foreground"
                >&lpar;{numOfContracts}&rpar;</span
              >
              <div class="text-sm text-muted-foreground leading-2">
                Hover dates to see details
              </div>
            </div>

            <div class="pr-1 relative pt-2">
              <ScrollArea class="h-[350px] pl-4 pr-3 text-sm pt-2">
                <div class="columns-2 gap-4 pb-6">
                  {#each empContracts as empContract}
                    <div class="break-inside-avoid mb-4">
                      <ContractHoverInfo data={empContract} />
                    </div>
                  {/each}
                </div>
              </ScrollArea>
              <div
                class="absolute -bottom-1 pointer-events-none w-[calc(100%_-_32px)] left-4 h-8 bg-gradient-to-t from-background to-transparent"
              ></div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    <Dialog.Footer class="px-6">
      <Dialog.Close class={buttonVariants({ variant: "outline" })}>
        Cancel
      </Dialog.Close>
      <Button
        disabled={isDeleting || !!empContracts}
        {onclick}
        variant="destructive"
      >
        {#if isDeleting}
          <Spinner />
        {/if}
        <span>Delete</span></Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
