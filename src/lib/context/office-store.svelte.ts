import { apiFetch } from "$lib/utils";
import { getContext, setContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";
const CONTEXT_KEY = Symbol("office-store");

type WithOfficePk =
  | {
      office_pk: number;
    }
  | { office_fk: number };

function createOfficeStoreContext<T extends WithOfficePk>(array: T[]) {
  let isFetching = $state(false);
  const offices = new SvelteMap<number, Office>();

  const officeIds = Array.from(
    new Set(
      array.map((item) =>
        "office_pk" in item ? item.office_pk : item.office_fk
      )
    )
  );

  async function fetchOffices(array?: T[]) {
    const offceIds = array
      ? Array.from(
          new Set(
            array.map((item) =>
              "office_pk" in item ? item.office_pk : item.office_fk
            )
          )
        )
      : officeIds;

    if (isFetching) return; // prevent duplicate fetches
    isFetching = true;

    const fetchPromises = offceIds.map(async (id) => {
      if (!offices.has(id)) {
        const res = await apiFetch(`/api/office?office_pk=${id}`);
        if (res.ok) {
          const office = (await res.json()) as Office | null;
          if (office) offices.set(id, office);
        }
      }
    });

    await Promise.all(fetchPromises);
    isFetching = false;
  }

  async function fetchOffice(id: number) {
    const res = await apiFetch(`/api/office?office_pk=${id}`);
    if (res.ok) {
      const office = (await res.json()) as Office | null;
      if (office) offices.set(id, office);
    }

    return offices.get(id);
  }

  async function getOffice(id: number) {
    const theOffice = offices.get(id);
    if (!theOffice) {
      return fetchOffice(id);
    }
    return theOffice;
  }

  // Auto fetch
  fetchOffices();

  return {
    get offices() {
      return offices;
    },
    get fetching() {
      return isFetching;
    },
    fetchOffices,
    getOffice,
  };
}

export type OfficeStoreContext = ReturnType<typeof createOfficeStoreContext>;

export function setOfficeStoreContext<T extends WithOfficePk>(array: T[]) {
  return setContext(CONTEXT_KEY, createOfficeStoreContext(array));
}

export function getOfficeStoreContext() {
  return getContext(CONTEXT_KEY) as OfficeStoreContext;
}
