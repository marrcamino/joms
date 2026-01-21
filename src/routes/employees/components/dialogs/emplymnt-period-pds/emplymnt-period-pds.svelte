<script lang="ts">
  import { Root, Content } from "$lib/components/ui/dialog/index.js";
  import { untrack, type Component } from "svelte";
  import type { ComponentProps } from "svelte";
  import { apiFetch, nDate, normalizeFormData } from "$lib/utils";
  import { getEmployeeContext } from "$routes/employees/context.svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    open?: boolean;
    afterSave?: (contract: ContractFromPDS) => void;
  }

  type FormData = {
    startDate: string;
    endDate: string;
    officePk: number;
    positionCategoryFk: null | number;
    designation: string;
    remarks: string | null;
    rate: number;
  };

  let {
    open = $bindable(false),
    afterSave,
    ...restProps
  }: Props &
    ComponentProps<typeof import("./content.svelte").default> = $props();

  const context = getEmployeeContext();

  let TheContent: Component | null = $state(null);

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    const id = context.openEmployee?.employee_pk;
    if (!id) {
      console.error("Dili ma save walay id");
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const formData = normalizeFormData(form) as FormData;

    console.log({ source_type: "pds", ...formData });
    // console.log($state.snapshot(context.openEmployee));

    const res = await apiFetch(`/api/employee/contract?employee_id=${id}`, {
      method: "POST",
      body: JSON.stringify({ source_type: "pds", ...formData }),
    });

    if (!res.ok) {
      toast.error("Unable to save employment period");
      return;
    }

    const contract_pk = (await res.json()).contract_pk as number;

    toast.success("Successfully added");
    afterSave?.({
      ...formData,
      contract_pk,
      employee_fk: id,
      start_date: formData.startDate,
      end_date: formData.endDate,
      position_category_fk: formData.positionCategoryFk,
      created_at: nDate.getCurrentTimestamp,
      is_active: 0,
      source_type: "pds",
      office_fk: formData.officePk,
      transmittal_item_fk: null,
    });
    form.reset();
  }

  $effect(() => {
    open;
    untrack(async () => {
      if (!open || TheContent) return;
      TheContent = (await import("./content.svelte")).default;
    });
  });
</script>

<Root bind:open>
  <Content class="w-[480px]">
    <form {onsubmit} autocomplete="off" class="grid gap-4 w-full">
      {#if TheContent}
        <TheContent {...restProps} />
      {:else}
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam ullam
        sed est sint facere iste cum illum doloribus excepturi, facilis dicta
        quis corrupti laboriosam sequi culpa beatae sapiente hic iure.
      {/if}
    </form>
  </Content>
</Root>
