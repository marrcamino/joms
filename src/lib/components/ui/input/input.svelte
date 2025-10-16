<script lang="ts">
  import type {
    HTMLInputAttributes,
    HTMLInputTypeAttribute,
  } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils.js";

  type InputType = Exclude<HTMLInputTypeAttribute, "file">;

  type Props = WithElementRef<
    Omit<HTMLInputAttributes, "type"> &
      (
        | { type: "file"; files?: FileList }
        | { type?: InputType; files?: undefined }
      ) & {
        /**
         * By default, a type `text` inputs would have onBlur event that will trim and remove duplicate white space
         *
         * @defaultValue `true`
         */
        autoTrim?: boolean;
      }
  >;

  let {
    ref = $bindable(null),
    value = $bindable(),
    type,
    files = $bindable(),
    class: className,
    "data-slot": dataSlot = "input",
    autoTrim = true,
    ...restProps
  }: Props = $props();

  function autoTrimFc(node: HTMLInputElement) {
    const handleBlur = () => {
      if (node.type !== "text") return; // Only apply for text inputs

      value = node.value.trim().replace(/\s+/g, " "); // Set the reactive value;
      node.value = node.value.trim().replace(/\s+/g, " ");
      node.dispatchEvent(new Event("input")); // Ensure Svelte updates the value
    };

    node.addEventListener("focusout", handleBlur);

    return {
      destroy() {
        node.removeEventListener("focusout", handleBlur);
      },
    };
  }
</script>

{#if type === "file"}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      "selection:bg-primary dark:bg-input/30 selection:text-primary-foreground border-input ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 pt-1.5 text-sm font-medium outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      className
    )}
    type="file"
    bind:files
    bind:value
    {...restProps}
  />
{:else if autoTrim}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      "border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      className
    )}
    {type}
    use:autoTrimFc
    bind:value
    {...restProps}
  />
{:else}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      "border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      className
    )}
    {type}
    bind:value
    {...restProps}
  />
{/if}
