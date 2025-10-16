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
