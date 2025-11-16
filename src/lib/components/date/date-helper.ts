import {
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";

export const dateHelper = {
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
};
