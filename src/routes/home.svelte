<script lang="ts">
  import RouteContent from "$lib/components/route-content.svelte";
  import { formatFullName } from "$lib/utils";

  export const mockNames = [
    // Simple name
    {
      firstName: "Juan",
      lastName: "Dela Cruz",
    },

    // With middle name
    {
      firstName: "Maria",
      middleName: "Reyes",
      lastName: "Santos",
    },

    // With prefix
    {
      prefix: "Dr.",
      firstName: "Jose",
      lastName: "Rizal",
    },

    // With multiple prefixes
    {
      prefix: "Atty., Dr.",
      firstName: "Elena",
      middleName: "Ramos",
      lastName: "Cruz",
    },

    // With extension (generational)
    {
      firstName: "Pedro",
      lastName: "Santos",
      extension: "Jr",
    },

    // With numeric extension
    {
      firstName: "Roberto",
      middleName: "Lopez",
      lastName: "Garcia",
      extension: "III",
    },

    // With suffix (professional titles)
    {
      firstName: "Cynthia",
      lastName: "Bautista",
      suffix: "CPA, MBA",
    },

    // With prefix + extension + suffix
    {
      prefix: "Engr.",
      firstName: "Ramon",
      middleName: "Villanueva",
      lastName: "Reyes",
      extension: "Sr",
      suffix: "PE, ASEAN Eng",
    },

    // Formal style edge case
    {
      prefix: "Atty.",
      firstName: "Isabel",
      middleName: "Morales",
      lastName: "Dela Peña",
      extension: "IV",
      suffix: "PhD",
    },

    // Complex example with abbreviations
    {
      prefix: "Atty., Dr.",
      firstName: "Francisco",
      middleName: "Alvarez",
      lastName: "Ramos",
      extension: "Jr",
      suffix: "CPA, LLM",
    },
    // Person with only suffix (no prefix)
    {
      firstName: "Leonardo",
      lastName: "Marquez",
      suffix: "PhD",
    },

    // Person with only extension but no suffix
    {
      firstName: "Antonio",
      middleName: "Santos",
      lastName: "Torres",
      extension: "II",
    },

    // Person with multiple suffixes and prefix
    {
      prefix: "Dr.",
      firstName: "Carina",
      middleName: "Velasco",
      lastName: "Gomez",
      suffix: "MD, FPCP",
    },

    // Person with only middle name (abbreviation test)
    {
      firstName: "Luis",
      middleName: "Dela",
      lastName: "Rosa",
    },

    // Complex: with prefix, middle, extension, suffix
    {
      prefix: "Atty., Dr.",
      firstName: "Fernando",
      middleName: "Cruz",
      lastName: "Delos Santos",
      extension: "Sr",
      suffix: "CPA, JD",
    },

    // Edge case: prefix string with extra commas/spaces
    {
      prefix: "  Dr. , Engr.  ",
      firstName: "Rosario",
      lastName: "Garcia",
      suffix: "PE",
    },

    // Minimal edge case: only last name and first name
    {
      firstName: "Ana",
      lastName: "Lim",
    },

    // Edge case: lowercased extension (testing normalization)
    {
      firstName: "Marc",
      lastName: "Reyes",
      extension: "sr",
    },

    // Edge case: database messy input with period in extension
    {
      firstName: "Paolo",
      lastName: "Ramos",
      extension: "Jr.",
      suffix: "MBA",
    },

    // Testing long suffix list
    {
      firstName: "Veronica",
      lastName: "Bautista",
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
