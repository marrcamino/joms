export const SEX_MAP = {
  1: "Male",
  2: "Female",
} as const satisfies Record<number, string>;
export type SEX_KEY = keyof typeof SEX_MAP;
