import type { SEX_KEY } from "$lib/constant";

declare global {
  /** http://localhost:8080/ */
  const BASE_URL: string;

  interface Office {
    office_pk: number;
    office_title: string;
    office_abbr: string;
  }

  interface Employee {
    employee_pk: number;
    firstname: string;
    lastname: string;
    middlename: string | null;
    extension: string | null;
    /**  1 = Male, 2 = Female */
    sex: SEX_KEY | null;
    birthday: string | null; // ISO date string (e.g. "1990-05-20")
    address: string | null;
    email: string | null;
    /** `null` means not active */
    office_fk: Office["office_pk"] | null;
    /** `null` means not active */
    designation: string | null;
    is_active: 0 | 1;
  }
}

export {};
