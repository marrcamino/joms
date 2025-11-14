export type EmptyStringMode = "null" | "empty" | "keep";
export type BooleanMode = "boolean" | "numeric";

export interface NormalizeFormOptions {
  /**
   * How to handle empty strings.
   * 'null'  → convert to null (default)
   * 'empty' → keep as ""
   * 'keep'  → do not alter
   */
  emptyString?: EmptyStringMode;

  /**
   * How to represent booleans.
   * 'boolean' → true / false (default)
   * 'numeric' → 1 / 0
   */
  booleanMode?: BooleanMode;
}

/**
 * Convert a FormData object into a plain object with proper JS types.
 *
 * @param form HTMLFormElement
 * @param options Optional conversion behavior
 * @returns Normalized object ready for JSON serialization
 */
export function normalizeFormData(
  form: HTMLFormElement,
  options: NormalizeFormOptions = {}
): Record<string, unknown> {
  const { emptyString = "null", booleanMode = "boolean" } = options;

  const formData = new FormData(form);
  const data: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    // Handle multiple values (checkbox group, multiple select)
    const allValues = formData.getAll(key);
    if (allValues.length > 1) {
      data[key] = allValues.map((v) =>
        parseValue(v, { emptyString, booleanMode })
      );
    } else {
      data[key] = parseValue(value, { emptyString, booleanMode });
    }
  }

  return data;
}

/**
 * Converts a string (from FormData) into a strongly-typed JS value.
 */
function parseValue(
  value: FormDataEntryValue,
  { emptyString, booleanMode }: Required<NormalizeFormOptions>
): unknown {
  // Skip File objects (from <input type="file">)
  if (value instanceof File) return value;

  const str = String(value);

  // "null" → null
  if (str === "null") return null;

  // Empty string
  if (str === "") {
    if (emptyString === "null") return null;
    if (emptyString === "empty") return "";
    if (emptyString === "keep") return str;
  }

  // "true"/"false"
  const booleanModeIsNumeric = booleanMode === "numeric";
  if (str === "true") return booleanModeIsNumeric ? 1 : true;
  if (str === "false") return booleanModeIsNumeric ? 0 : false;

  // Numeric check ("1200" → 1200)
  const num = Number(str);
  if (!isNaN(num) && str.trim() !== "") return num;

  // Otherwise return string as-is
  return str;
}
