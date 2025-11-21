import {
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";

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

/** Date helper for `@internationalized/date` */
export const cDate = {
  /** Returns today's date (CalendarDate) */
  get getToday(): DateValue {
    return today(getLocalTimeZone());
  },

  /** Returns the latest birthdate allowed for an 18-year-old (today - 18 years) */
  get getMinimumBirthDate(): DateValue {
    const now = today(getLocalTimeZone());
    return now.subtract({ years: 18 });
  },

  /** Returns tomorrow’s date */
  get getTomorrow(): DateValue {
    const now = today(getLocalTimeZone());
    return now.add({ days: 1 });
  },

  /** Returns yesterday’s date */
  get getYesterday(): DateValue {
    const now = today(getLocalTimeZone());
    return now.subtract({ days: 1 });
  },
};

/** Date helper for `Native / ISO` dates */
export const nDate = {
  /** Returns date like `1994-05-23` */
  get getISOToday() {
    return new Date().toISOString().split("T")[0];
  },

  /** Parses a date string and returns `[year, month, day]` based on the `Asia/Manila` timezone. */
  parseDateParts(date: string): [number, number, number] {
    const d = new Date(date);

    const f = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const [y, m, dd] = f.format(d).split("-").map(Number);

    return [y, m, dd];
  },

  isDateEnded(isoDate: string) {
    const now = new Date();
    const targetDate = new Date(isoDate);
    return targetDate < now;
  },

  dateStatus(isoDate: string) {
    const now = new Date();
    const target = new Date(isoDate);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );

    if (targetDay < today) return "past";
    if (targetDay.getTime() === today.getTime()) return "today";
    return "future";
  },
};
