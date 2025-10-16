<script lang="ts">
  interface Props {
    required?: boolean;
    name?: string;
  }

  let { required = $bindable(undefined), name = $bindable(undefined) }: Props =
    $props();
</script>

<input
  {required}
  {name}
  aria-hidden="true"
  tabindex="-1"
  autocomplete="off"
  style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px; transform: translateX(-100%);"
/>
