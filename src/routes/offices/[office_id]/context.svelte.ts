import { getContext, setContext } from "svelte";

const OFFICE_TRANSMITTAL_CONTEXT_KEY = Symbol("OfficeTransmittalContextKey");

function createOfficeTransmittalContext() {
  let transmittals: Transmittal[] = $state([]);

  return {
    get transmittals() {
      return transmittals;
    },
    set transmittals(value: Transmittal[]) {
      transmittals = value;
    },
  };
}

export type OfficeTransmittalContext = ReturnType<
  typeof createOfficeTransmittalContext
>;

export function setOfficeTransmittalContext() {
  return setContext(
    OFFICE_TRANSMITTAL_CONTEXT_KEY,
    createOfficeTransmittalContext()
  );
}
export function getOfficeTransmittalContext() {
  return getContext(OFFICE_TRANSMITTAL_CONTEXT_KEY) as OfficeTransmittalContext;
}
