<script lang="ts">
  import EmpBasicInfo from "$lib/components/emp-basic-info.svelte";
  import { Button } from "$lib/components/ui/button";

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
  }
</script>

<form autocomplete="off" {onsubmit}>
  <EmpBasicInfo asContent />
  <div class="mt-4 flex justify-end w-full">
    <Button type="submit" size="sm">Save Changes</Button>
  </div>
</form>
