interface NameParts {
  prefix?: string; // comma-separated, parsed internally
  firstName: string;
  middleName?: string | null;
  lastName: string;
  extension?: string | null; // no period stored
  suffix?: string | null; // comma-separated, parsed internally
}

interface NameFormatOptions {
  order?: "normal" | "formal"; // default: 'normal'
  abbreviateMiddle?: boolean; // default: false
  includePrefix?: boolean; // default: true
  includeSuffix?: boolean; // default: true
}

function parseListString(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function formatPrefixes(prefix?: string | null): string {
  const list = parseListString(prefix);
  if (list.length === 0) return "";
  return list.join(" ");
}

function formatSuffixes(suffix?: string | null): string {
  const list = parseListString(suffix);
  if (list.length === 0) return "";
  return list.join(", ");
}

function formatExtension(extension?: string | null): string {
  if (!extension) return "";

  const clean = extension.replace(/\./g, "").trim(); // remove any accidental periods

  // Define which ones should have a period
  const withPeriod = ["JR", "SR"];

  // If extension is "JR" or "SR", add a period
  if (withPeriod.includes(clean.toUpperCase())) {
    return `${clean.charAt(0).toUpperCase()}${clean.slice(1).toLowerCase()}.`;
  }

  // Otherwise, just return as-is (like III, IV, V)
  return clean.toUpperCase();
}

function formatMiddleName(
  middleName?: string | null,
  abbreviate = false
): string {
  if (!middleName) return "";

  const clean = middleName.trim();

  if (abbreviate && clean.length > 0) {
    return clean.charAt(0).toUpperCase() + ".";
  }

  return clean;
}

export function formatFullName(
  parts: NameParts,
  options: NameFormatOptions = {}
): string {
  const { prefix, firstName, middleName, lastName, extension, suffix } = parts;

  const {
    order = "normal",
    abbreviateMiddle = false,
    includePrefix = true,
    includeSuffix = true,
  } = options;

  // Format individual parts
  const prefixText = includePrefix ? formatPrefixes(prefix) : "";
  const middleText = formatMiddleName(middleName, abbreviateMiddle);
  const extensionText = formatExtension(extension);
  const suffixText = includeSuffix ? formatSuffixes(suffix) : "";

  let fullName = "";

  if (order === "formal") {
    // Example: Dela Cruz, Juan R., Jr., CPA
    fullName = `${lastName}, ${firstName}${middleText ? " " + middleText : ""}${
      extensionText ? ", " + extensionText : ""
    }${suffixText ? ", " + suffixText : ""}`;
  } else {
    // Example: Atty. Juan R. Dela Cruz, Jr., CPA
    fullName = `${prefixText ? prefixText + " " : ""}${firstName}${
      middleText ? " " + middleText : ""
    } ${lastName}${extensionText ? ", " + extensionText : ""}${
      suffixText ? ", " + suffixText : ""
    }`;
  }

  // Clean up double spaces and trim
  return fullName.replace(/\s+/g, " ").trim();
}
