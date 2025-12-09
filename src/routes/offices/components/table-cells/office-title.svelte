<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";

  interface Props {
    office: Office;
  }

  let { office }: Props = $props();
</script>

<div>
  <span>{office.office_title}</span>
  <Badge variant="outline">{office.office_abbr}</Badge>
</div>
