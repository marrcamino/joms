import { apiFetch } from "$lib/utils";
import { getContext, setContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

const CONTEXT_KEY = Symbol("apointment-categ-store");

type WithPositionCategPk =
  | { position_category_pk: number }
  | { position_category_fk: number | null };

function createPositionCategStoreContext<T extends WithPositionCategPk>(
  array: T[]
) {
  let isFetching = $state(false);
  const categories = new SvelteMap<number, PositionCategory>();

  const categIds = Array.from(
    new Set(
      array.map((item) =>
        "position_category_pk" in item
          ? item.position_category_pk
          : item.position_category_fk
      )
    )
  );

  async function fetchCategories(array?: T[]) {
    const offceIds = array
      ? Array.from(
          new Set(
            array.map((item) =>
              "position_category_pk" in item
                ? item.position_category_pk
                : item.position_category_fk
            )
          )
        )
      : categIds;

    if (isFetching) return; // prevent duplicate fetches
    isFetching = true;

    const fetchPromises = offceIds
      .filter((c) => c !== null)
      .map(async (id) => {
        if (!categories.has(id)) {
          const res = await apiFetch(
            `/api/position-category?position_category_pk=${id}`
          );
          if (res.ok) {
            const category = (await res.json()) as PositionCategory | null;
            if (category) categories.set(id, category);
          }
        }
      });

    await Promise.all(fetchPromises);
    isFetching = false;
  }

  async function fetchCategory(id: number) {
    const res = await apiFetch(
      `/api/position-category?position_category_pk=${id}`
    );
    if (res.ok) {
      const category = (await res.json()) as PositionCategory | null;
      if (category) categories.set(id, category);
    }

    return categories.get(id);
  }

  async function getCategory(id: number) {
    const theCategory = categories.get(id);
    if (!theCategory) {
      return fetchCategory(id);
    }
    return theCategory;
  }

  // Auto fetch
  fetchCategories();

  return {
    get categories() {
      return categories;
    },
    get fetching() {
      return isFetching;
    },
    fetchCategories,
    getCategory,
  };
}

export type OfficeStoreContext = ReturnType<
  typeof createPositionCategStoreContext
>;

export function setPositionCategoryStoreContext<T extends WithPositionCategPk>(
  array: T[]
) {
  return setContext(CONTEXT_KEY, createPositionCategStoreContext(array));
}

export function getPositionCategoryStoreContext() {
  return getContext(CONTEXT_KEY) as OfficeStoreContext;
}
