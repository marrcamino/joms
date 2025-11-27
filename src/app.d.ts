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
    /** `1` if they have an active contract, otherwise `0` */
    is_active: 0 | 1;
  }

  interface PositionCategory {
    position_categ_pk: number;
    post_categ_name: string;
  }

  interface Contract {
    contract_pk: number;
    employee_fk: Employee["employee_pk"];
    start_date: string; // ISO date  (e.g. "1990-05-20")
    end_date: string; // ISO date  (e.g. "1990-05-20")
    designation: string;
    rate: number;
    office_fk: Office["office_pk"];
    position_category_fk: PositionCategory["position_categ_pk"] | null;
    remarks: string | null;
    is_active: 0 | 1;
  }
}

export {};
