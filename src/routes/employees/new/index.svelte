<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { apiFetch, normalizeFormData } from "$lib/utils";
  import { ChevronLeft } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { getEmployeeContext } from "../context.svelte";
  import Form from "./components/form.svelte";

  const context = getEmployeeContext();
  let scrollArea: HTMLElement | null = null;

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const res = await apiFetch(`/api/employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizeFormData(form)),
    });

    if (!res.ok) {
      toast.error("Failed to add employee");
      console.error(await res.json());
      return;
    }

    toast.success("Employee created successfully");
    form.reset();
    const result = (await res.json()) as {
      hasContract: boolean;
      employee_pk: number;
      employee: any;
    };

    const lnameElement = document.getElementById("lname") as HTMLInputElement;
    scrollToTop();
    setTimeout(() => {
      lnameElement?.focus();
    }, 300);

    context.add(result.employee, result.hasContract);
  }

  function scrollToTop() {
    const viewport = scrollArea?.querySelector("[data-scroll-area-viewport]");
    viewport?.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<svelte:head>
  <title>New Employee</title>
</svelte:head>

<RouteContent bind:scrollAreaRef={scrollArea}>
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
    <Form />
  </form>
</RouteContent>
