import { apiFetch } from "$lib/utils";
import { getContext, setContext } from "svelte";

const OFFICE_CONTEXT_KEY = Symbol("OfficeContextKey");

function createOfficeContext() {
  let offices: Office[] = $state([]);

  async function initData() {
    const res = await apiFetch("/api/office");
    if (!res.ok) return;
    const data = (await res.json()) as Office[];
    offices = data;
  }

  function getOffice(office_pk: number) {
    return offices.find((office) => office.office_pk === office_pk);
  }

  return {
    get offices() {
      return offices;
    },
    set offices(ofcs: Office[]) {
      offices = ofcs;
    },
    initData,
    getOffice,
  };
}

export type OfficeContext = ReturnType<typeof createOfficeContext>;

export function setOfficeContext() {
  return setContext(OFFICE_CONTEXT_KEY, createOfficeContext());
}
export function getOfficeContext() {
  return getContext(OFFICE_CONTEXT_KEY) as OfficeContext;
}
