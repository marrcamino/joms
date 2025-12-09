<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { formatDate, formatFullName } from "$lib/utils";
  import { Pencil, Trash2 } from "@lucide/svelte";
  import { ScrollState } from "runed";
  import { fly } from "svelte/transition";
  import { getOfficeContext } from "../../context.svelte";
  import { getDraftTransmittalContext } from "../../components/transmittal-dialog/context.svelte";
  import EmptyTransmittal from "./empty-transmittal.svelte";
  import AddEmployeeDialog from "./add-employee-dialog.svelte";

  const context = getOfficeContext();
  const transContext = getDraftTransmittalContext();

  let el = $state<HTMLElement>();
  const scroll = new ScrollState({ element: () => el });
  let remarks = $state("");

  let isEmpty = $derived(transContext.empTrans.length === 0);

  let arrivedRight = $derived.by(() => {
    if (Number.isNaN(scroll.progress.x)) return "";
    return Math.round(scroll.progress.x) >= 95 ? "" : null;
  });
</script>

<div>
  <div>
    <div>
      <div
        bind:this={el}
        data-right={arrivedRight}
        class="group relative w-full overflow-x-auto pb-8"
      >
        <Table.Root noWrapper>
          <Table.Header class="**:border **:text-center **:uppercase">
            <Table.Row>
              <Table.Head rowspan={2}>NO.</Table.Head>
              <Table.Head rowspan={2}>FULL NAME</Table.Head>
              <Table.Head rowspan={2}>DESIGNATION</Table.Head>
              <Table.Head rowspan={2}>RATE PER DAY</Table.Head>
              <Table.Head colspan={2}>Contract Period</Table.Head>
              <Table.Head rowspan={2}>Funding Charge</Table.Head>
              <Table.Head rowspan={2}>Office Assignment</Table.Head>
              <Table.Head rowspan={2}>NO. OF DAYS</Table.Head>
              <Table.Head rowspan={2}>ACTIONS</Table.Head>
            </Table.Row>
            <Table.Row>
              <Table.Head>FROM</Table.Head>
              <Table.Head>TO</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each transContext.empTrans as emp, i (emp.uuid)}
              {@const office = context.getOffice(Number(emp.office_fk))}
              <tr
                transition:fly={{ x: -10, duration: 200 }}
                class="**:border first:!border-t-2 group/row hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
              >
                <Table.Cell class="text-center">{i + 1}</Table.Cell>
                <Table.Cell>{formatFullName(emp)}</Table.Cell>
                <Table.Cell>{emp.designation}</Table.Cell>
                <Table.Cell class="text-center">{emp.rate}</Table.Cell>
                <Table.Cell class="text-center"
                  >{formatDate(emp.start_date)}</Table.Cell
                >
                <Table.Cell class="text-center"
                  >{formatDate(emp.end_date)}</Table.Cell
                >
                <Table.Cell class="text-center">{emp.fund_charge}</Table.Cell>
                <Table.Cell>
                  {office?.office_title}
                  <Badge variant="outline">{office?.office_abbr}</Badge>
                </Table.Cell>
                <Table.Cell class="text-center">{emp.num_of_days}</Table.Cell>

                <Table.Cell class="sticky right-0 p-0">
                  <div class="border-none">
                    <div
                      class="p-2 border-none group-data group-hover/row:opacity-100 opacity-0 group-data-[right]:opacity-100 group-data-[right]:bg-transparent bg-background"
                    >
                      <ButtonGroup.Root class="border-none place-self-center">
                        <Tooltip.Provider delayDuration={100}>
                          <Tooltip.Root>
                            <Tooltip.Trigger
                              class={buttonVariants({
                                variant: "outline",
                                size: "icon-sm",
                              })}
                              onclick={() => {
                                transContext.empTranToEdit = emp;
                                transContext.addEmpDialogState = true;
                              }}
                            >
                              <Pencil class="border-none" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>Edit</p>
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>

                        <Tooltip.Provider delayDuration={100}>
                          <Tooltip.Root>
                            <Tooltip.Trigger
                              class={buttonVariants({
                                variant: "ghost-destructive",
                                size: "icon-sm",
                              })}
                              onclick={() => {
                                transContext.remove(emp.uuid);
                              }}
                            >
                              <Trash2 class="border-none" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>Remove</p>
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </ButtonGroup.Root>
                    </div>
                  </div>
                </Table.Cell>
              </tr>
            {:else}
              <Table.Row>
                <Table.Cell colspan={10} class="hover:!bg-transparent">
                  <EmptyTransmittal />
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>

      {#if !isEmpty}
        <div class="pt-4">
          <Label for="remarks" class="leading-6 gap-1">
            Remarks/Note
            <span class="text-muted-foreground">&lpar;Optional&rpar;</span>
          </Label>
          <Textarea
            class="max-w-2xl"
            autoTrim
            autoHeight
            id="remarks"
            bind:value={remarks}
            placeholder="Enter remarks or note for this transmittal"
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<AddEmployeeDialog />
