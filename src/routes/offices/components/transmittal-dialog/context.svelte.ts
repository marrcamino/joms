import type { TransmittalContractItems } from "$lib/types";
import { mkUUID } from "$lib/utils";
import { getContext, setContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";

const DRAFT_TRANSMITTAL_CONTEXT = Symbol("draftTransmittalContext");

function createDraftTransmittalContext() {
  let empTrans: EmployeeAndTransmittalInfo[] = $state([]);
  let firstEmp = $derived(empTrans.length ? empTrans[0] : null);
  let employeeIds = $derived(new SvelteSet(empTrans.map((e) => e.employee_fk)));
  let addEmpDialogState = $state(false);
  let empTranToEdit: EmployeeAndTransmittalInfo | null = $state(null);
  let office: Office | null = $state(null);
  let transToEdit: null | number = $state(null);
  let noOverlapCheck = false;
  let useTransDialogState = $state(false);

  function resetData() {
    empTrans = [];
    empTranToEdit = null;
  }

  function sort(emps: EmployeeAndTransmittalInfo[]) {
    return emps.sort((a, b) => {
      const ln = (a.lastname ?? "").localeCompare(b.lastname ?? "", undefined, {
        sensitivity: "base",
      });
      if (ln !== 0) return ln;
      const fn = (a.firstname ?? "").localeCompare(
        b.firstname ?? "",
        undefined,
        { sensitivity: "base" }
      );
      if (fn !== 0) return fn;
      return (a.middlename ?? "").localeCompare(b.middlename ?? "", undefined, {
        sensitivity: "base",
      });
    });
  }

  /**
   * Gets the overall date range from a list of employee transmittal records.
   *
   * Finds:
   * - the earliest `start_date`
   * - the latest `end_date`
   *
   * Assumes `start_date` and `end_date` are ISO date strings (YYYY-MM-DD),
   * so string comparison is safe and efficient.
   *
   * @param list - Array of EmployeeAndTransmittalInfo records
   * @returns An object containing the earliest start date and latest end date,
   *          or `null` if the list is empty
   */
  function getDateRange() {
    if (empTrans.length === 0) return null;

    let minStart = empTrans[0].start_date;
    let maxEnd = empTrans[0].end_date;

    for (const item of empTrans) {
      if (item.start_date < minStart) {
        minStart = item.start_date;
      }

      if (item.end_date > maxEnd) {
        maxEnd = item.end_date;
      }
    }

    return {
      start_date: minStart,
      end_date: maxEnd,
    };
  }

  /**
   * Gets a comma-separated list of unique source funds
   * from a list of employee transmittal records.
   *
   * Example return value:
   * "PGO-B, General Fund"
   *
   * @param list - Array of EmployeeAndTransmittalInfo records
   * @returns Comma-separated string of unique fund sources,
   *          or an empty string if the list is empty
   */
  function getSourceFunds() {
    if (empTrans.length === 0) return "";

    const uniqueFunds = new Set<string>();
    for (const item of empTrans) {
      if (item.fund_charge?.trim()) {
        uniqueFunds.add(item.fund_charge.trim());
      }
    }

    return Array.from(uniqueFunds).join(", ");
  }

  function add(newEmp: Omit<EmployeeAndTransmittalInfo, "uuid">) {
    //Pwede na e remove and uuid; gamit lang siya kung e edit ang employee, pero karon dili na pwede e edit/replace ang employee
    empTrans = sort([...empTrans, { ...newEmp, uuid: mkUUID() }]);
  }

  function update(empTran: EmployeeAndTransmittalInfo) {
    const newEmpTrans = empTrans.map((e) => {
      if (e.uuid === empTran.uuid) {
        return empTran;
      }
      return e;
    });

    empTrans = sort(newEmpTrans);
  }

  function remove(id: string) {
    empTrans = empTrans.filter((e) => e.uuid !== id);
  }

  function setEmployeeTransmittal(trans: TransmittalContractItems[]) {
    empTrans = trans.map((t) => convertToValidEmpTrans(t));
  }

  function convertToValidEmpTrans(
    t: TransmittalContractItems
  ): EmployeeAndTransmittalInfo {
    return {
      firstname: t.firstname,
      lastname: t.lastname,
      middlename: t.middlename,
      extension: t.extension,
      rate: t.rate.toString(),
      employee_fk: t.employee_pk,
      fund_charge: t.funding_charge,
      num_of_days: t.num_of_days.toString(),
      designation: t.designation,
      end_date: t.end_date,
      start_date: t.start_date,
      uuid: mkUUID(),
      office_fk: t.office_fk.toString(),
      transmittal_item_fk: t.transmittal_item_pk,
    };
  }

  function bulkAdd(
    trans: TransmittalContractItems[],
    otherInfo: { start_date: string; end_date: string; num_of_days: string }
  ) {
    empTrans = trans.map((t) => ({
      ...convertToValidEmpTrans(t),
      ...otherInfo,
    }));
  }

  return {
    /** Add Employee Dialog State */
    get addEmpDialogState() {
      return addEmpDialogState;
    },
    get noOverlapCheck() {
      return noOverlapCheck;
    },
    get empTrans() {
      return empTrans;
    },
    get employeeIds() {
      return employeeIds;
    },
    get firstEmp() {
      return firstEmp;
    },
    get empTranToEdit() {
      return empTranToEdit;
    },
    get office() {
      return office;
    },
    get transToEdit() {
      return transToEdit;
    },
    get useTransDialogState() {
      return useTransDialogState;
    },
    set addEmpDialogState(value: boolean) {
      addEmpDialogState = value;
    },
    set noOverlapCheck(value: boolean) {
      noOverlapCheck = value;
    },
    set empTrans(value: EmployeeAndTransmittalInfo[]) {
      empTrans = value;
    },
    set empTranToEdit(value: EmployeeAndTransmittalInfo | null) {
      empTranToEdit = value;
    },
    set office(value: Office | null) {
      office = value;
    },
    set transToEdit(value: null | number) {
      transToEdit = value;
    },
    set useTransDialogState(value: boolean) {
      useTransDialogState = value;
    },
    add,
    update,
    remove,
    bulkAdd,
    resetData,
    getDateRange,
    getSourceFunds,
    setEmployeeTransmittal,
    convertToValidEmpTrans,
  };
}

type DraftTransmittalContext = ReturnType<typeof createDraftTransmittalContext>;
export type EmployeeAndTransmittalInfo = Pick<
  Employee,
  "firstname" | "lastname" | "middlename" | "extension"
> & {
  employee_fk: number;
  uuid: string;
  designation: string;
  rate: string;
  start_date: string;
  end_date: string;
  office_fk: string;
  fund_charge: string;
  num_of_days: string;
  transmittal_item_fk?: number;
};

export function setDraftTransmittalContext() {
  return setContext(DRAFT_TRANSMITTAL_CONTEXT, createDraftTransmittalContext());
}
export function getDraftTransmittalContext() {
  return getContext(DRAFT_TRANSMITTAL_CONTEXT) as DraftTransmittalContext;
}
