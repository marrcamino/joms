import { apiFetch } from "$lib/utils";
import { getContext, setContext } from "svelte";

const OFFICE_CONTEXT_KEY = Symbol("OfficeContextKey");

function createOfficeContext() {
  let offices: Office[] = $state([]);
  let officeDialogState = $state(false);
  let deleteDialogState = $state(false);
  let transmittalPageState = $state(false);

  let openOffice: null | Office = $state(null);
  let addTransmittal = $state(false);

  async function loadTableData() {
    const res = await apiFetch("/api/office");
    if (!res.ok) return;
    const data = (await res.json()) as Office[];
    offices = data;
  }

  function getOffice(office_pk: number) {
    return offices.find((office) => office.office_pk === office_pk);
  }

  function add(office: Office) {
    offices = [...offices, office];
  }

  function remove(id: number) {
    offices = offices.filter((o) => o.office_pk !== id);
  }

  function update(office: Office) {
    offices = offices.map((o) => {
      if (o.office_pk === office.office_pk) return office;
      return o;
    });
  }

  /** This will set the openOffice and opens the delete dialog  */
  function openDeleteDialog(office: Office) {
    openOffice = office;
    deleteDialogState = true;
  }

  /** This currently use for updating office informations */
  function openOfficeDialog(office: Office) {
    openOffice = office;
    officeDialogState = true;
  }

  return {
    get offices() {
      return offices;
    },
    /** Use for deleting and updating office */
    get openOffice() {
      return openOffice;
    },
    get officeDialogState() {
      return officeDialogState;
    },
    get transmittalPageState() {
      return transmittalPageState;
    },
    get deleteDialogState() {
      return deleteDialogState;
    },
    /** Used to automaticcally open transmittal page at `/#/offices/{officeId}`*/
    get addTransmittal() {
      return addTransmittal;
    },
    set officeDialogState(value: boolean) {
      officeDialogState = value;
    },
    set deleteDialogState(value: boolean) {
      deleteDialogState = value;
    },
    set transmittalPageState(value: boolean) {
      transmittalPageState = value;
    },
    set addTransmittal(value: boolean) {
      addTransmittal = value;
    },
    set offices(offcs: Office[]) {
      offices = offcs;
    },
    /** Use for deleting and updating office */
    set openOffice(offcs: Office | null) {
      openOffice = offcs;
    },

    loadTableData,
    getOffice,
    openDeleteDialog,
    openOfficeDialog,
    add,
    remove,
    update,
  };
}

export type OfficeContext = ReturnType<typeof createOfficeContext>;

export function setOfficeContext() {
  return setContext(OFFICE_CONTEXT_KEY, createOfficeContext());
}
/** For all offices */
export function getOfficeContext() {
  return getContext(OFFICE_CONTEXT_KEY) as OfficeContext;
}
