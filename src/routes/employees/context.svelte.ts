import { apiFetch, createLOSCalculator } from "$lib/utils";
import { getContext, setContext } from "svelte";
import { MediaQuery } from "svelte/reactivity";

type EmployeeWithUpdatedActiveStatus = Pick<
  Employee,
  "employee_pk" | "office_fk" | "designation" | "is_active"
>;

const EMPLOYEE_CONTEXT_KEY = Symbol("employeeContextKey");
const SIDE_SHEET_CONTENT_CONTEXT_KEY = Symbol("sideSheetContentKey");

function createEmployeeContext() {
  /** This store the original array, usefull when reverting data after filtering */
  let _origEmployees: Employee[] = $state([]);
  let newAdded: Employee[] = $state([]);
  let employees: Employee[] = $state([]);
  let sheetOpenState = $state(false);
  let openEmployee: Employee | null = $state(null);

  async function initData() {
    const res = await apiFetch("/api/employee?is_active=all");

    if (!res.ok) return;

    const data = (await res.json()) as Employee[];

    _origEmployees = data;
    employees = data;
  }

  function add(employee: Employee, withContract = false) {
    if (!withContract) {
      newAdded = [...newAdded, employee];
      return;
    }

    employees = [...employees, employee];
    _origEmployees = [..._origEmployees, employee];
  }

  function updateEmpBasicInfo(
    employee: Omit<Employee, "office_fk" | "designation" | "is_active">
  ) {
    let updated: Employee | null = null;

    employees = employees.map((e) => {
      if (e.employee_pk === employee.employee_pk) {
        updated = { ...e, ...employee };
        return updated;
      }
      return e;
    });

    return updated;
  }

  function remove(id: number) {
    employees = employees.filter((e) => e.employee_pk !== id);
  }

  function updateActiveStatus<T extends EmployeeWithUpdatedActiveStatus>(
    employee: T
  ) {
    let updatedEmployee: Employee | null = null;

    employees = employees.map((e) => {
      if (employee.employee_pk === e.employee_pk) {
        updatedEmployee = { ...e, ...employee };
        return updatedEmployee;
      }
      return e;
    });
    if (updatedEmployee) openEmployee = updatedEmployee;
  }

  function resetEmployeeDesignation(id: number) {
    let updatedEmployee: Employee | null = null;

    employees = employees.map((e) => {
      if (id === e.employee_pk) {
        updatedEmployee = {
          ...e,
          office_fk: null,
          designation: null,
          is_active: 0,
        };
        return updatedEmployee;
      }
      return e;
    });
    if (updatedEmployee) openEmployee = updatedEmployee;
  }

  function setEmployeeDesignation<
    T extends Pick<Employee, "employee_pk" | "designation" | "office_fk">
  >(emp: T) {
    let updatedEmployee: Employee | null = null;

    employees = employees.map((e) => {
      if (emp.employee_pk === e.employee_pk) {
        updatedEmployee = {
          ...e,
          office_fk: emp.office_fk,
          designation: emp.designation,
          is_active: 1,
        };
        return updatedEmployee;
      }
      return e;
    });
    if (updatedEmployee) openEmployee = updatedEmployee;
  }

  return {
    get origEmployees() {
      return _origEmployees;
    },
    get employees() {
      return employees;
    },
    get newAdded() {
      return newAdded;
    },
    get sheetOpenState() {
      return sheetOpenState;
    },
    get openEmployee() {
      return openEmployee;
    },

    set employees(emps: Employee[]) {
      employees = emps;
    },
    set newAdded(emps: Employee[]) {
      newAdded = emps;
    },
    set sheetOpenState(value: boolean) {
      sheetOpenState = value;
    },
    set openEmployee(value: Employee | null) {
      openEmployee = value;
    },

    initData,
    add,
    updateEmpBasicInfo,
    remove,
    updateActiveStatus,
    resetEmployeeDesignation,
    setEmployeeDesignation,
  };
}

function createSideSheetContentContext() {
  let contracts: undefined | Contract[] = $state();
  /** For `deleting` or `Updating` contract */
  let selectedContract: null | Contract = $state(null);

  const los = createLOSCalculator();
  // Dialog States
  let addDialogState = $state(false);
  let editDialogState = $state(false);
  let editEmployeeState = $state(false);
  let deleteContractAlertDialogState = $state(false);
  let deleteEmployeeAlertDialogState = $state(false);
  let activeContractAlertDialogState = $state(false);
  let deactiveContractAlertDialogState = $state(false);
  let counts = $derived(los.calculate(contracts));

  let isFetching = $state(false);
  let hasActiveContract = $derived(
    contracts?.some((c) => c.is_active) ?? false
  );

  function add(contract: Contract) {
    const newList = [contract, ...($state.snapshot(contracts) ?? [])];
    contracts = sortContractsByLatest(newList);
  }

  /** Deletes the contract */
  async function remove(id: number) {
    if (!contracts) return;
    contracts = sortContractsByLatest(
      contracts.filter((c) => c.contract_pk !== id)
    );
  }

  function update(contract: Contract) {
    if (!contracts) return;

    contracts = sortContractsByLatest(
      contracts.map((c) => {
        if (c.contract_pk === contract.contract_pk) return contract;
        return c;
      })
    );
  }

  function sortContractsByLatest(contracts: Contract[]) {
    return contracts.sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );
  }

  function updateActiveContract(id: number, isActive: boolean = true) {
    const is_active = Number(isActive) as 0 | 1;
    if (isActive) {
      contracts = contracts?.map((c) => {
        if (c.contract_pk === id) return { ...c, is_active };
        return { ...c, is_active: 0 };
      });

      return;
    }

    contracts = contracts?.map((c) => {
      if (c.contract_pk === id) return { ...c, is_active };
      return c;
    });
  }

  async function getContract(employeeId: number) {
    isFetching = true;
    const res = await apiFetch(
      `/api/employee/contract?employee_id=${employeeId}`
    );

    if (!res.ok) {
      isFetching = false;
      return;
    }

    const data = ((await res.json()) as { data: Contract[] }).data;

    contracts = sortContractsByLatest(data);
    isFetching = false;
  }

  function getActiveContract() {
    return contracts?.some((c) => c.is_active);
  }

  return {
    get contracts() {
      return contracts;
    },
    get selectedContract() {
      return selectedContract;
    },
    get addDialogState() {
      return addDialogState;
    },
    get editDialogState() {
      return editDialogState;
    },
    get editEmployeeState() {
      return editEmployeeState;
    },
    get deleteContractAlertDialogState() {
      return deleteContractAlertDialogState;
    },
    get deleteEmployeeAlertDialogState() {
      return deleteEmployeeAlertDialogState;
    },
    get isFetching() {
      return isFetching;
    },
    get hasActiveContract() {
      return hasActiveContract;
    },
    get activeContractAlertDialogState() {
      return activeContractAlertDialogState;
    },
    get deactiveContractAlertDialogState() {
      return deactiveContractAlertDialogState;
    },
    get counts() {
      return counts;
    },
    /** Length of Service Calculator */
    get los() {
      return los;
    },

    set contracts(v: undefined | Contract[]) {
      contracts = v;
    },
    set selectedContract(v: null | Contract) {
      selectedContract = v;
    },
    set addDialogState(v: boolean) {
      addDialogState = v;
    },
    set editDialogState(v: boolean) {
      editDialogState = v;
    },
    set editEmployeeState(v: boolean) {
      editEmployeeState = v;
    },
    set deleteContractAlertDialogState(v: boolean) {
      deleteContractAlertDialogState = v;
    },
    set deleteEmployeeAlertDialogState(v: boolean) {
      deleteEmployeeAlertDialogState = v;
    },
    set isFetching(v: boolean) {
      isFetching = v;
    },
    set activeContractAlertDialogState(v: boolean) {
      activeContractAlertDialogState = v;
    },
    set deactiveContractAlertDialogState(v: boolean) {
      deactiveContractAlertDialogState = v;
    },

    getContract,
    sortContractsByLatest,
    getActiveContract,
    updateActiveContract,
    add,
    remove,
    update,
  };
}

export type EmployeeContext = ReturnType<typeof createEmployeeContext>;
export type SideSheetContentContext = ReturnType<
  typeof createSideSheetContentContext
>;

export function setEmployeeContext() {
  return setContext(EMPLOYEE_CONTEXT_KEY, createEmployeeContext());
}
export function setSideSheetContentContext() {
  return setContext(
    SIDE_SHEET_CONTENT_CONTEXT_KEY,
    createSideSheetContentContext()
  );
}

export function getEmployeeContext() {
  return getContext(EMPLOYEE_CONTEXT_KEY) as EmployeeContext;
}
export function getSideSheetContentContext() {
  return getContext(SIDE_SHEET_CONTENT_CONTEXT_KEY) as SideSheetContentContext;
}

export const sheetIsVisible = new MediaQuery("max-width: 930px");
