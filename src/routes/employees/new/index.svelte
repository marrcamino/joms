<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { ChevronLeft } from "@lucide/svelte";
  import BasicInformation from "./components/basic-information.svelte";
  import { toast } from "svelte-sonner";
  import { apiFetch } from "$lib/utils";
  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const res = await apiFetch(`/api/employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Failed to create employee");
      console.error(await res.json());
      return;
    }
    toast.success("Employee created successfully");
    form.reset();
    const result = (await res.json()) as {
      success: boolean;
      employee_pk: number;
    };
    console.log(result);
  }
</script>

<svelte:head>
  <title>New Employee</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    <div>Add New Employee</div>
    <Button
      class="ml-auto"
      size="sm"
      onclick={() => {
        window.history.back();
      }}
    >
      <ChevronLeft />
      <span>Go Back</span>
    </Button>
  {/snippet}
  <form class="max-w-md mx-auto" autocomplete="off" {onsubmit}>
    <BasicInformation />
  </form>
</RouteContent>
