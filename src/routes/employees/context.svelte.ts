import { apiFetch } from "$lib/utils";
import { getContext, setContext } from "svelte";

const EMPLOYEE_CONTEXT_KEY = Symbol("employeeContextKey");

function createEmployeeContext() {
  /** This store the original array, usefull when reverting data after filtering */
  let _origEmployees: Employee[] = $state([]);
  let newAdded: Employee[] = $state([]);
  let employees: Employee[] = $state([]);

  async function initData() {
    const res = await apiFetch("/api/employee");

    if (!res.ok) return;

    const data = (await res.json()) as Employee[];

    _origEmployees = data;
    employees = data;
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

    set employees(emps: Employee[]) {
      employees = emps;
    },
    set newAdded(emps: Employee[]) {
      newAdded = emps;
    },

    initData,
  };
}

export type EmployeeContext = ReturnType<typeof createEmployeeContext>;

export function setEmployeeContext() {
  return setContext(EMPLOYEE_CONTEXT_KEY, createEmployeeContext());
}

export function getEmployeeContext() {
  return getContext(EMPLOYEE_CONTEXT_KEY) as EmployeeContext;
}
