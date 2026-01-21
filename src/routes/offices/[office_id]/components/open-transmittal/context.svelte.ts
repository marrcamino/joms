import type { TransmittalContractItems } from "$lib/types";
import { getContext, setContext } from "svelte";

const OFFICE_TRANSMITTAL_CONTEXT = Symbol("officeTransmittalContext");

function createOfficeTransmittalContext() {
  let items: TransmittalContractItems[] = $state([]);
  let openItem: TransmittalContractItems | null = $state(null);
  let deleteDialogState = $state(false);

  function add(emp: TransmittalContractItems) {
    const ladtTrans = [...$state.snapshot(items), emp];
    items = sortByLastname(ladtTrans);
    return getLatestDetails();
  }

  function removeItem(id: number) {
    items = items.filter((i) => i.transmittal_item_pk !== id);
  }

  function getLatestDetails() {
    const getDateRange = () => {
      let minStart = items[0].start_date;
      let maxEnd = items[0].end_date;

      for (const item of items) {
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
    };

    const getSourceFunds = () => {
      if (items.length === 0) return "";

      const uniqueFunds = new Set<string>();
      for (const item of items) {
        if (item.funding_charge?.trim()) {
          uniqueFunds.add(item.funding_charge.trim());
        }
      }

      return Array.from(uniqueFunds).join(", ");
    };
    return {
      ...getDateRange(),
      funding_charge: getSourceFunds(),
      numOfEmp: items.length,
    };
  }

  function openDeleteDialog(item: TransmittalContractItems) {
    openItem = item;
    deleteDialogState = true;
  }

  function updateTransmittalInfo(item: TransmittalContractItems) {
    items = items.map((t) => {
      if (t.transmittal_item_pk === item.transmittal_item_pk) return item;
      return t;
    });

    return getLatestDetails();
  }

  function sortByLastname(theItems: TransmittalContractItems[], desc = false) {
    return [...theItems].sort((a, b) => {
      const aLast = (a.lastname ?? "").trim().toLowerCase();
      const bLast = (b.lastname ?? "").trim().toLowerCase();
      return desc ? bLast.localeCompare(aLast) : aLast.localeCompare(bLast);
    });
  }

  return {
    get openItem() {
      return openItem;
    },
    get items() {
      return items;
    },
    get deleteDialogState() {
      return deleteDialogState;
    },
    set deleteDialogState(value: boolean) {
      deleteDialogState = value;
    },
    set openItem(value: TransmittalContractItems | null) {
      openItem = value;
    },
    set items(value: TransmittalContractItems[]) {
      items = sortByLastname(value);
    },
    add,
    removeItem,
    openDeleteDialog,
    getLatestDetails,
    updateTransmittalInfo,
  };
}

type OpenTransmittalContext = ReturnType<typeof createOfficeTransmittalContext>;

/** Transmittals for specific office */
export function setOfficeTransmittalContext() {
  return setContext(
    OFFICE_TRANSMITTAL_CONTEXT,
    createOfficeTransmittalContext()
  );
}
export function getOfficeTransmittalContext() {
  return getContext(OFFICE_TRANSMITTAL_CONTEXT) as OpenTransmittalContext;
}
