export interface TransmittalContractItems {
  transmittal_item_pk: number;
  transmittal_pk: number;
  employee_pk: number;
  firstname: string;
  middlename: string | null;
  lastname: string;
  extension: string | null;
  designation: string;
  rate: number;
  start_date: string;
  end_date: string;
  funding_charge: string;
  office_fk: number;
  num_of_days: string;
}
