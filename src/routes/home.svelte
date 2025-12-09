<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { formatFullName } from "$lib/utils";

  export const mockNames = [
    // Simple name
    {
      firstname: "Juan",
      lastname: "Dela Cruz",
    },

    // With middle name
    {
      firstname: "Maria",
      middlename: "Reyes",
      lastname: "Santos",
    },

    // With prefix
    {
      prefix: "Dr.",
      firstname: "Jose",
      lastname: "Rizal",
    },

    // With multiple prefixes
    {
      prefix: "Atty., Dr.",
      firstname: "Elena",
      middlename: "Ramos",
      lastname: "Cruz",
    },

    // With extension (generational)
    {
      firstname: "Pedro",
      lastname: "Santos",
      extension: "Jr",
    },

    // With numeric extension
    {
      firstname: "Roberto",
      middlename: "Lopez",
      lastname: "Garcia",
      extension: "III",
    },

    // With suffix (professional titles)
    {
      firstname: "Cynthia",
      lastname: "Bautista",
      suffix: "CPA, MBA",
    },

    // With prefix + extension + suffix
    {
      prefix: "Engr.",
      firstname: "Ramon",
      middlename: "Villanueva",
      lastname: "Reyes",
      extension: "Sr",
      suffix: "PE, ASEAN Eng",
    },

    // Formal style edge case
    {
      prefix: "Atty.",
      firstname: "Isabel",
      middlename: "Morales",
      lastname: "Dela Peña",
      extension: "IV",
      suffix: "PhD",
    },

    // Complex example with abbreviations
    {
      prefix: "Atty., Dr.",
      firstname: "Francisco",
      middlename: "Alvarez",
      lastname: "Ramos",
      extension: "Jr",
      suffix: "CPA, LLM",
    },
    // Person with only suffix (no prefix)
    {
      firstname: "Leonardo",
      lastname: "Marquez",
      suffix: "PhD",
    },

    // Person with only extension but no suffix
    {
      firstname: "Antonio",
      middlename: "Santos",
      lastname: "Torres",
      extension: "II",
    },

    // Person with multiple suffixes and prefix
    {
      prefix: "Dr.",
      firstname: "Carina",
      middlename: "Velasco",
      lastname: "Gomez",
      suffix: "MD, FPCP",
    },

    // Person with only middle name (abbreviation test)
    {
      firstname: "Luis",
      middlename: "Dela",
      lastname: "Rosa",
    },

    // Complex: with prefix, middle, extension, suffix
    {
      prefix: "Atty., Dr.",
      firstname: "Fernando",
      middlename: "Cruz",
      lastname: "Delos Santos",
      extension: "Sr",
      suffix: "CPA, JD",
    },

    // Edge case: prefix string with extra commas/spaces
    {
      prefix: "  Dr. , Engr.  ",
      firstname: "Rosario",
      lastname: "Garcia",
      suffix: "PE",
    },

    // Minimal edge case: only last name and first name
    {
      firstname: "Ana",
      lastname: "Lim",
    },

    // Edge case: lowercased extension (testing normalization)
    {
      firstname: "Marc",
      lastname: "Reyes",
      extension: "sr",
    },

    // Edge case: database messy input with period in extension
    {
      firstname: "Paolo",
      lastname: "Ramos",
      extension: "Jr.",
      suffix: "MBA",
    },

    // Testing long suffix list
    {
      firstname: "Veronica",
      lastname: "Bautista",
      suffix: "RN, MAN, PhD, DScN",
    },
  ];

  let current = $state(0);

  const up = () => {
    if (current > 0) current--;
  };

  const down = () => {
    if (current < mockNames.length - 1) current++;
  };
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<RouteContent>
  {#snippet header()}
    Dashbaord
  {/snippet}
  <div class="p-4 flex items-center gap-2">
    <div class="px-4 w-[80px]">{current + 1}/{mockNames.length}</div>
    <div class="inline-flex border rounded-lg overflow-hidden">
      <button
        class="px-3 py-2 hover:bg-foreground/20 active:bg-foreground/5 disabled:opacity-50 disabled:pointer-events-none"
        disabled={current === 0}
        onclick={up}
      >
        ▲
      </button>
      <button
        class="px-3 py-2 hover:bg-foreground/20 active:bg-foreground/5 border-l disabled:opacity-50 disabled:pointer-events-none"
        disabled={current === mockNames.length - 1}
        onclick={down}
      >
        ▼
      </button>
    </div>
  </div>

  <div class="border p-4">
    <div class="text-muted-foreground">Order:Normal</div>
    {formatFullName(mockNames[current])}
  </div>

  <div class="border p-4 pt-1">
    <div class="text-muted-foreground">Order:Formal</div>
    {formatFullName(mockNames[current], {
      order: "formal",
    })}
  </div>

  <div class="border p-4 pt-1">
    <div class="text-muted-foreground">
      Order:Normal, Abbreviated Middle Name
    </div>
    {formatFullName(mockNames[current], {
      abbreviateMiddle: true,
    })}
  </div>

  <div class="border p-4 pt-1">
    <div class="text-muted-foreground">
      Order:Formal, Abbreviated Middle Name
    </div>
    {formatFullName(mockNames[current], {
      order: "formal",
      abbreviateMiddle: true,
    })}
  </div>

  <div>
    <pre>
       {JSON.stringify(mockNames[current], null, 1).replace(/[{}]/g, "")}
    </pre>
  </div>
</RouteContent>
