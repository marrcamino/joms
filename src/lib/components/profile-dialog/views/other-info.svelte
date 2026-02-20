<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Button } from "$lib/components/ui/button";

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
  }
</script>

<form autocomplete="off" {onsubmit} class="mt-3">
  <div class="space-y-4">
    <div class="grid w-full max-w-sm items-center gap-1">
      <Label for="indigenous-name">Indigenous Name</Label>
      <Input id="indigenous-name" type="text" />
    </div>

    <div class="grid w-full max-w-sm items-center gap-1">
      <Label for="disability-id-number">Disability ID Number</Label>
      <Input id="disability-id-number" type="text" />
    </div>

    <div class="grid w-full max-w-sm items-center gap-1">
      <Label for="solo-parent-id-number">Solo Parent ID Number</Label>
      <Input id="solo-parent-id-number" type="text" />
    </div>
  </div>
  <div class="mt-4 flex justify-end w-full">
    <Button type="submit" size="sm">Save Changes</Button>
  </div>
</form>