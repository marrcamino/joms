import { mkUUID } from "$lib/utils";
import { getContext, setContext } from "svelte";

const TRANSMITTAL_CONTEXT = Symbol("TransittalContext");

function createTransmittalContext() {
  let empTrans: EmployeeAndTransmittalInfo[] = $state([]);
  let firstEmp = $derived(empTrans.length ? empTrans[0] : null);
  let employeeIds = $derived([...new Set(empTrans.map((e) => e.employee_fk))]);
  let secondDialogState = $state(false);
  let empTranToEdit: EmployeeAndTransmittalInfo | null = $state(null);

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
  function getSourceFunds(): string {
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

  return {
    get secondDialogState() {
      return secondDialogState;
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

    set secondDialogState(value: boolean) {
      secondDialogState = value;
    },
    set empTrans(value: EmployeeAndTransmittalInfo[]) {
      empTrans = value;
    },
    set empTranToEdit(value: EmployeeAndTransmittalInfo | null) {
      empTranToEdit = value;
    },
    add,
    update,
    remove,
    resetData,
    getDateRange,
    getSourceFunds,
  };
}

export type TransmittalContext = ReturnType<typeof createTransmittalContext>;
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
};

export function setTransmittalContext() {
  return setContext(TRANSMITTAL_CONTEXT, createTransmittalContext());
}
export function getTransmittalContext() {
  return getContext(TRANSMITTAL_CONTEXT) as TransmittalContext;
}
