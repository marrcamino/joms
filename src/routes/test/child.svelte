<script lang="ts">
  interface Props {
    api?: {
      doWork: (val: string) => string;
      reset: () => void;
    };
  }

  let { api = $bindable() }: Props = $props();

  let count = $state(0);

  // The internal logic
  function doWork(val: string) {
    count++;
    console.log(`Child logic: ${val}. Count is ${count}`);
    return "yes";
  }

  function reset() {
    count = 0;
    console.log("Reseted: \n\n");
  }

  // Bind the internal functions to the prop so the parent can see them
  // This happens once when the component initializes
  api = { doWork, reset };
</script>

<div class="p-4 border">I am the child component.</div>
