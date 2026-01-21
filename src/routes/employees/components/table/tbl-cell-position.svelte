<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { getOfficeContext } from "$routes/offices/context.svelte";
  import { CircleQuestionMark } from "@lucide/svelte";
  interface Props {
    designation: string | null;
    office_fk: number | null;
  }

  let { designation, office_fk }: Props = $props();

  const officeContext = getOfficeContext();
</script>

<p class="text-pretty min-w-[300px]">
  {#if designation}
    {@const office = office_fk ? officeContext.getOffice(office_fk) : undefined}

    <span>
      {designation}
    </span>

    {#if office}
      <Tooltip.Provider delayDuration={300}>
        <Tooltip.Root>
          <Tooltip.Trigger
            class="focus-visible:border-ring ml-1 pr-1 cursor-help focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] hover:bg-accent dark:hover:bg-input/50"
          >
            <span class="-translate-y-[1px]">{office.office_abbr}</span>
            <CircleQuestionMark class="inline text-muted-foreground size-3" />
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>
              {office.office_title}
            </p>
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    {/if}
  {:else}
    <Badge variant="outline-destructive" class="">Inactive</Badge>
  {/if}
</p>
