import { apiFetch } from "$lib/utils";
import { getContext, setContext } from "svelte";
import { MediaQuery } from "svelte/reactivity";

const EMPLOYEE_CONTEXT_KEY = Symbol("employeeContextKey");

function createEmployeeContext() {
  /** This store the original array, usefull when reverting data after filtering */
  let _origEmployees: Employee[] = $state([]);
  let newAdded: Employee[] = $state([]);
  let employees: Employee[] = $state([]);
  let sheetOpenState = $state(false);
  let openEmployee: Employee | null = $state(null);

  async function initData() {
    const res = await apiFetch("/api/employee");

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
  };
}

export type EmployeeContext = ReturnType<typeof createEmployeeContext>;

export function setEmployeeContext() {
  return setContext(EMPLOYEE_CONTEXT_KEY, createEmployeeContext());
}

export function getEmployeeContext() {
  return getContext(EMPLOYEE_CONTEXT_KEY) as EmployeeContext;
}

export const sheetIsVisible = new MediaQuery("max-width: 930px");
