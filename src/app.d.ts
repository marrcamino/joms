import type { SEX_KEY } from "$lib/constant";

declare global {
  /** http://localhost:8080/ */
  const BASE_URL: string;

  type Primitive =
    | string
    | number
    | boolean
    | bigint
    | symbol
    | null
    | undefined;

  interface Office {
    office_pk: number;
    office_abbr: string;
    office_title: string;
  }

  interface BaseEmployee {
    employee_pk: number;
    firstname: string;
    lastname: string;
    middlename: string | null;
    extension: string | null;
    /** 1 = Male, 2 = Female */
    sex: SEX_KEY | null;
    birthday: string | null; // ISO date string
    address: string | null;
    email: string | null;
  }

  interface ActiveEmployee extends BaseEmployee {
    is_active: 1;
    office_fk: Office["office_pk"];
    designation: string;
  }

  interface InactiveEmployee extends BaseEmployee {
    is_active: 0;
    office_fk: null;
    designation: null;
  }

  type Employee = ActiveEmployee | InactiveEmployee;

  interface PositionCategory {
    position_categ_pk: number;
    post_categ_name: string;
  }

  interface FundingSource {
    funding_source_pk: number;
    source_name: string;
    remarks: string | null;
  }

  interface Transmittal {
    transmittal_pk: number;
    office_fk: number;
    start_date: string;
    end_date: string;
    funding_charge: string;
    remarks: string | null;
  }

  interface TransmittalItem {
    transmittal_item_pk: number;
    transmittal_fk: Transmittal["transmittal_pk"];
    fund_charge: string;
    num_of_days: string;
  }

  type ContractSourceType = "contract" | "pds" | "transmittal";

  // Contract
  interface BaseContract {
    contract_pk: number;
    employee_fk: Employee["employee_pk"];
    start_date: string; // ISO date  (e.g. "1990-05-20")
    end_date: string; // ISO date  (e.g. "1990-05-20")
    designation: string;
    rate: number;
    office_fk: Office["office_pk"];
    position_category_fk: PositionCategory["position_categ_pk"] | null;
    remarks: string | null;
    /** YYYY-MM-DD HH:mm:ss */
    created_at: string;
    is_active: 0 | 1;
  }

  interface ContractFromContractOrPDS extends BaseContract {
    source_type: Exclude<ContractSourceType, "transmittal">;
    transmittal_item_fk: null;
  }

  interface ContractFromTransmittal extends BaseContract {
    source_type: Extract<ContractSourceType, "transmittal">;
    transmittal_item_fk: TransmittalItem["transmittal_item_pk"];
  }

  type Contract = ContractFromContractOrPDS | ContractFromTransmittal;
}

export {};
