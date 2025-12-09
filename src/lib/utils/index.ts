import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

/**
 * Converts a record of key-value pairs into an array of { value, label } objects.
 * Both `value` and `label` will always be strings.
 *
 * @template T - The record key type (number or string).
 * @param {Record<T, string>} map - The record to convert.
 * @returns {{ value: string; label: string }[]} - An array of objects with stringified value and label properties.
 *
 * @example
 * const STATUS_MAP = { 1: "Active", 0: "Inactive" };
 * const statusList = mapToOptions(STATUS_MAP);
 * // Result: [ { value: "1", label: "Active" }, { value: "0", label: "Inactive" } ]
 */
export function mapToOptions<T extends string | number>(
  map: Record<T, string>
): { value: string; label: string }[] {
  return Object.entries(map).map(([value, label]) => ({
    value: String(value),
    label: String(label),
  }));
}

/**
 * A wrapper around the native `fetch` API that automatically prepends the BASE_URL.
 * Designed for internal API calls only.
 *
 * @param {string} endpoint - The endpoint path (e.g. "/api/employee").
 * @param {RequestInit} [options] - Optional fetch configuration like method, headers, and body.
 * @returns {Promise<Response>} The standard Fetch API Response object.
 *
 * @example
 * const res = await apiFetch("/api/employee/check-duplicate", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify(data),
 * });
 *
 * const json = await res.json();
 */
export async function apiFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
  return fetch(url, options);
}

/**
 * Formats a name extension for display by applying standard punctuation.
 *
 * - Adds a period to `Jr` or `Sr` (→ `Jr.` / `Sr.`)
 * - Leaves Roman numerals like `III`, `IV`, etc. unchanged
 * - Trims whitespace and ensures proper casing
 *
 * @param extension - The name extension string, typically stored as `Jr`, `Sr`, `III`, etc.
 * @returns The formatted extension for display (e.g., `Jr.`), or `undefined` if not provided
 *
 * @example
 * ```ts
 * formatNameExtension('Jr')  // "Jr."
 * formatNameExtension('III') // "III"
 * formatNameExtension()      // undefined
 * ```
 */
export function formatNameExtension(
  extension?: string | null
): string | undefined {
  if (!extension) return undefined;

  const clean = extension.trim();

  // capitalize only first letter
  const proper = clean[0].toUpperCase() + clean.slice(1).toLowerCase();

  if (proper === "Jr" || proper === "Sr") {
    return `${proper}.`; // add dot
  }

  return proper; // e.g., III, IV stays as written
}

export interface FullNameParts {
  /**
   * Optional title that comes before the name.
   *
   * Example: "Atty.", "Dr.", "Engr."
   */
  professionalPrefix?: string | null;

  /**
   * The person's given name.
   *
   * Example: "Juan"
   */
  firstName: string;

  /**
   * The person's middle name.
   *
   * Example: "Carlos"
   */
  middleName?: string | null;

  /**
   * The person's last name or surname.
   *
   * Example: "Dela Cruz"
   */
  lastName: string;

  /**
   * Optional generational name extension.
   *
   * Example: "Jr.", "Sr.", "III"
   */
  nameExtension?: string | null;

  /**
   * Optional professional or academic suffix.
   *
   * Example: "CPA", "PhD", "RPh"
   */
  professionalSuffix?: string | null;
}

/**
 * Generates a unique identifier (UUID) in 6 characters with optional prefix and/or suffix.
 *
 * @param options - An optional object containing `prefix` and/or `suffix` strings to be added
 *              as a prefix or suffix to the generated UUID.
 *              - `prefix`: A string to prepend to the UUID.
 *              - `suffix`: A string to append to the UUID.
 *
 * @returns A string representing the generated UUID with the optional prefix and/or suffix.
 *
 * @example
 * // Generate a UUID with no prefix or suffix
 * const uuid = mkUUID();
 * console.log(uuid); // Example output: "a1b2c3"
 *
 * @example
 * // Generate a UUID with a prefix
 * const uuidWithPrefix = mkUUID({ prefix: "ID-" });
 * console.log(uuidWithPrefix); // Example output: "ID-a1b2c3"
 *
 * @example
 * // Generate a UUID with a suffix
 * const uuidWithSuffix = mkUUID({ suffix: "-END" });
 * console.log(uuidWithSuffix); // Example output: "a1b2c3-END"
 *
 * @example
 * // Generate a UUID with both prefix and suffix
 * const uuidWithBoth = mkUUID({ prefix: "ID-", suffix: "-END" });
 * console.log(uuidWithBoth); // Example output: "ID-a1b2c3-END"
 */
export function mkUUID(options?: { prefix?: string; suffix?: string }) {
  const prefix = options?.prefix?.trim() ?? "";
  const suffix = options?.suffix?.trim() ?? "";
  return `${prefix}${uuidv4().replace(/[-_]/g, "").slice(0, 6)}${suffix}`;
}

type FormatReadableOptions = {
  separator?: string;
  lastSeparator?: string;
};

/**
 * Formats a comma-separated string into a human-readable list.
 *
 * Rules:
 * - Assumes values are separated by commas
 * - Trims extra whitespace around each value
 * - Uses configurable separators for readability
 *
 * Examples:
 * ```ts
 * formatReadable("A"); // "A"
 * formatReadable("A, B"); // "A, & B"
 * formatReadable("A, B, C"); // "A, B, & C"
 * formatReadable("A, B, C", { lastSeparator: " and " }); // "A, B and C"
 * ```
 *
 * @param value - Comma-separated string (e.g. "A, B, C")
 * @param options - Optional formatting configuration
 * @param options.separator - Separator used between items (default: ", ")
 * @param options.lastSeparator - Separator used before the last item (default: ", & ")
 * @returns A human-readable formatted string
 */
export function formatReadable(
  value: string,
  { separator = ", ", lastSeparator = ", & " }: FormatReadableOptions = {}
) {
  const items = value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}${lastSeparator}${items[1]}`;

  return items.slice(0, -1).join(separator) + lastSeparator + items.at(-1);
}

/**
 * Returns a random valid index based on an array or a numeric length.
 *
 * If an array is provided, the index will be within its bounds.
 * If a number is provided, it is treated as the length.
 * Returns `-1` when the input is empty or not a positive number.
 *
 * @param source - An array or a number representing a length
 * @returns A random index from `0` to `length - 1`, or `-1` if invalid
 *
 * @example
 * randomIndex([10, 20, 30]) // → 0 | 1 | 2
 *
 * @example
 * randomIndex(5) // → 0 | 1 | 2 | 3 | 4
 *
 * @example randomIndex([])
 * // → -1
 */
export function randomIndex<T>(source: readonly T[] | number): number {
  const length =
    typeof source === "number" ? Math.floor(source) : source.length;

  if (length <= 0) return -1;

  return Math.floor(Math.random() * length);
}

export * from "./form-normalizer";
export * from "./name-formatter";
export * from "./duration-calculator";
export * from "./date-helper";
export * from "./date-prettifier";
export * from "./tanstack-helper";
