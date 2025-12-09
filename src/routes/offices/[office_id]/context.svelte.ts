import { getContext, setContext, tick } from "svelte";

const OFFICE_ALL_TRANSMITTAL_CONTEXT_KEY = Symbol(
  "OfficeTransmittalContextKey"
);
type TransmittalWithEmpCount = Transmittal & { numOfEmp?: number };
type PartialExceptPK = { transmittal_pk: number } & Partial<
  Omit<TransmittalWithEmpCount, "transmittal_pk">
>;

function createOfficeAllTransmittalContext() {
  let office: null | Office = $state(null);
  let transmittals: TransmittalWithEmpCount[] = $state([]);
  let openTransmittal: null | TransmittalWithEmpCount = $state(null);
  let deleteDialogState = $state(false);
  let drawerState = $state(false);

  async function openDeleteDialog(transmittal: TransmittalWithEmpCount) {
    openTransmittal = transmittal;
    await tick();
    deleteDialogState = true;
  }

  async function openDrawer(transmittal: TransmittalWithEmpCount) {
    openTransmittal = transmittal;
    await tick();
    drawerState = true;
  }

  function addTransmittal(trans: TransmittalWithEmpCount) {
    transmittals = [trans, ...transmittals];
  }

  function removeTransmittal(id: number) {
    transmittals = transmittals.filter((t) => t.transmittal_pk !== id);
  }

  function updateTransmittal(trans: PartialExceptPK) {
    transmittals = transmittals.map((t) => {
      if (t.transmittal_pk === trans.transmittal_pk) return { ...t, ...trans };
      return t;
    });
  }

  /**
   * Update the open transmittal which `inside the drawer`, then;
   * Reflect this updates to the list of all the transmittal of the office
   */
  function updateOpenTransmittalInfo(updates: {
    funding_charge: string;
    numOfEmp: number;
    start_date: string;
    end_date: string;
  }) {
    if (!openTransmittal) {
      console.warn("No open transmittal");
      return;
    }

    const { transmittal_pk } = openTransmittal;

    const updatedTrans = { ...openTransmittal, ...updates };
    openTransmittal = updatedTrans;

    transmittals = transmittals.map((t) => {
      if (t.transmittal_pk === transmittal_pk) return updatedTrans;
      return t;
    });
  }

  /** Primarily used for table data on load */
  function updateTransmittalContractCounts(
    transmittal_pk: number,
    counts: number
  ) {
    transmittals = transmittals.map((t) => {
      if (t.transmittal_pk === transmittal_pk)
        return { ...t, numOfEmp: counts };
      return t;
    });
  }

  return {
    /** Used for children component for `/#/offices/{office_pk}` */
    get office() {
      return office;
    },
    get transmittals() {
      return transmittals;
    },
    get openTransmittal() {
      return openTransmittal;
    },
    get deleteDialogState() {
      return deleteDialogState;
    },
    get drawerState() {
      return drawerState;
    },

    set office(value: Office | null) {
      office = value;
    },
    set transmittals(value: TransmittalWithEmpCount[]) {
      transmittals = value;
    },
    set openTransmittal(value: TransmittalWithEmpCount | null) {
      openTransmittal = value;
    },
    set deleteDialogState(value: boolean) {
      deleteDialogState = value;
    },
    set drawerState(value: boolean) {
      drawerState = value;
    },

    openDeleteDialog,
    openDrawer,
    addTransmittal,
    removeTransmittal,
    updateTransmittal,
    updateOpenTransmittalInfo,
    updateTransmittalContractCounts,
  };
}

type OfficeTransmittalContext = ReturnType<
  typeof createOfficeAllTransmittalContext
>;
/** Transmittals for specific office */
export function setOfficeAllTransmittalContext() {
  return setContext(
    OFFICE_ALL_TRANSMITTAL_CONTEXT_KEY,
    createOfficeAllTransmittalContext()
  );
}
export function getOfficeAllTransmittalContext() {
  return getContext(
    OFFICE_ALL_TRANSMITTAL_CONTEXT_KEY
  ) as OfficeTransmittalContext;
}
