<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { getOfficeContext } from "$routes/offices/context.svelte";

  interface Props {
    designation: string | null;
    office_fk: number | null;
  }

  let { designation, office_fk }: Props = $props();

  const officeContext = getOfficeContext();
</script>

<p>
  {#if designation}
    <span>
      {designation}
    </span>

    {@const office = office_fk ? officeContext.getOffice(office_fk) : undefined}
    {#if office}
      <Badge
        variant="outline"
        class="ml-1 cursor-help"
        title={office.office_title}
      >
        {office.office_abbr}
      </Badge>
    {/if}
  {:else}
    <Badge variant="destructive">Inactive</Badge>
  {/if}
</p>
