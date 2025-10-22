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
};
