import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
 * Returns a formatted full name string with optional professional prefix and suffix.
 *
 * @param parts - Object containing parts of a person's name
 * @returns The formatted full name, suitable for formal display
 *
 * @example
 * ```ts
 * import { formatFullName } from './formatFullName';
 *
 * const fullName = formatFullName({
 *   professionalPrefix: 'Atty.',
 *   firstName: 'Juan',
 *   middleName: 'Carlos',
 *   lastName: 'Dela Cruz',
 *   nameExtension: 'Jr.',
 *   professionalSuffix: 'CPA'
 * });
 *
 * console.log(fullName); // "Atty. Juan Carlos Dela Cruz Jr., CPA"
 * ```
 */
export function formatFullName(
  {
    professionalPrefix,
    firstName,
    middleName,
    lastName,
    nameExtension,
    professionalSuffix,
  }: FullNameParts,
  format?: { order?: "lastname" | "firstname"; middlename?: "full" | "initial" }
): string {
  const middlename =
    format?.middlename === "initial"
      ? `${middleName ? middleName.trim().at(0) : ""}.`
      : `${middleName ? middleName.trim() : ""}`;

  const fullName = [
    professionalPrefix?.trim(),
    firstName.trim(),
    middlename,
    lastName.trim() + (nameExtension ? "," : ""),
    formatNameExtension(nameExtension),
  ]
    .filter(Boolean)
    .join(" ");

  if (format?.order === "lastname") {
    const suffix = professionalSuffix?.trim()
      ? `, ${professionalSuffix?.trim()}`
      : "";

    const middleWithExtension = middlename
      ? `${middlename}${
          nameExtension ? ", " + (formatNameExtension(nameExtension) ?? "") : ""
        }`
      : `${
          nameExtension ? ", " + (formatNameExtension(nameExtension) ?? "") : ""
        }`;

    return `${
      professionalPrefix ? professionalPrefix.trim() + ". " : ""
    } ${lastName.trim()}, ${firstName.trim()} ${middleWithExtension}${suffix}`;
  }

  return professionalSuffix?.trim()
    ? `${fullName}, ${professionalSuffix.trim()}`
    : fullName;
}

/**
 * Formats a date (Date object or ISO string) into a readable string.
 *
 * @param input - A Date object or a date string (e.g. "1987-07-12T00:00:00.000Z").
 * @param options - Optional settings.
 * @param options.format - Format style:
 *   - `'long'` (default): e.g. "July 12, 1987"
 *   - `'short'`: e.g. "Jul 12, 1987"
 *   - `'numeric'`: e.g. "07/12/1987"
 *
 * @defaultReturn Current date if no input is provided.
 * @returns A formatted date string.
 */
export function formatDate(
  input: Date | string = new Date(),
  format?: "long" | "short" | "numeric"
): string {
  const date = typeof input === "string" ? new Date(input) : input;

  if (isNaN(date.getTime())) return "Invalid Date";

  format = format ?? "short";

  const formatOptions: Intl.DateTimeFormatOptions =
    format === "numeric"
      ? { month: "2-digit", day: "2-digit", year: "numeric" }
      : format === "short"
      ? { month: "short", day: "numeric", year: "numeric" }
      : { month: "long", day: "numeric", year: "numeric" };

  return new Intl.DateTimeFormat("en-US", formatOptions).format(date);
}
