export const SEX_MAP = {
  1: "Male",
  2: "Female",
} as const satisfies Record<number, string>;
export type SEX_KEY = keyof typeof SEX_MAP;

// APPOINTMENT STATUS
export const APPOINTMENT_STATUS_MAP = {
  1: "Job Order",
  2: "Contract of Service",
  3: "Memorandum of Aggremeent",
} as const satisfies Record<number, string>;
export const APPOINTMENT_STATUS_ABBR_MAP = {
  1: "JO",
  2: "COS",
  3: "MOA",
} as const satisfies Record<APPOINTMENT_STATUS_KEY, string>;
export type APPOINTMENT_STATUS_KEY = keyof typeof APPOINTMENT_STATUS_MAP;

export * from "./colors.const";
export * from "./icons.const";
