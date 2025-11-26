<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px] px-0">
    <Dialog.Header class="px-6">
      <Dialog.Title>Edit Employee</Dialog.Title>
      <Dialog.Description>
        Fields marked with asterisk &lpar;<span class="text-destructive">*</span
        >&rpar; are required.
      </Dialog.Description>
    </Dialog.Header>

    <ScrollArea style="height: 450px;" class="px-6">
      <div>
        {#each Array.from({ length: 10 }) as _}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta minima
          voluptate fugiat non, sapiente voluptatum dolorem eveniet repellendus
          corrupti, beatae facere sit veritatis earum. Eum dignissimos totam
          voluptatum nesciunt qui!
        {/each}
      </div>
    </ScrollArea>
    <Dialog.Footer class="px-6">
      <Button type="submit">Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
