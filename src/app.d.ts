import type { SEX_KEY } from "$lib/constant";

declare global {
  /** http://localhost:8080/ */
  const BASE_URL: string;

  interface Employee {
    employee_pk: number;
    firstname: string;
    lastname: string;
    middlename?: string | null;
    extension?: string | null;
    /**  1 = Male, 2 = Female */
    sex: SEX_KEY;
    birthday: string; // ISO date string (e.g. "1990-05-20")
    address?: string | null;
    email?: string | null;
  }
}

export {};
