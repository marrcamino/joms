import { dateHelper } from "$lib/components/date/date-helper";

interface DateRangeBase {
  start_date: string;
  end_date: string;
}

export interface ContractBase extends DateRangeBase {
  is_active: 0 | 1;
  [key: string]: any;
}

// helper to add one day to ISO date
function addOneDay(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
/** First contract will be on the index 0 */
function sortContractsByStartDate<T extends { start_date: string }>(
  contracts: T[]
): T[] {
  return [...contracts].sort((a, b) => {
    return a.start_date.localeCompare(b.start_date);
  });
}

function getStableRange(contracts: ContractBase[]) {
  if (contracts.length <= 1) return contracts;

  // INTERNAL METHODS
  const getActiveContract = (contracts: ContractBase[]) => {
    const index = contracts.findIndex((c) => c.is_active === 1);
    return { contract: contracts[index] as ContractBase | undefined, index };
  };
  const getLastEndedContract = (contracts: ContractBase[]) => {
    const today = dateHelper.getISOToday;
    let index = 0;
    for (const [i, contract] of contracts.entries()) {
      if (contract.end_date <= today) {
        index = i;
        break;
      }
    }

    return index ?? index - 1;
  };

  // This make the active contract easy to find. This also give a lot of advantages.
  // After reversing, the newest contract will be at index 0 and the oldest at the last index.
  contracts.reverse();

  // Setting the end date (latest contract)
  const activeContract = getActiveContract(contracts);
  if (activeContract.contract) {
    contracts = contracts.slice(activeContract.index);
  } else contracts = contracts.slice(getLastEndedContract(contracts));

  // Setting the start date (old contract)
  for (const [i, contract] of contracts.entries()) {
    const nextContract = contracts[i + 1] as ContractBase | undefined;

    if (
      nextContract &&
      contract.start_date !== addOneDay(contracts[i + 1].end_date)
    ) {
      contracts = contracts.slice(undefined, i + 1);
      break;
    }
  }

  return contracts.reverse();
}

function setEffectiveCutoffDate(contracts: ContractBase[]) {
  const latestContract = contracts.pop() as ContractBase;

  const today = new Date().toISOString().split("T")[0];

  if (latestContract.is_active === 1) {
    return {
      contracts: [...contracts, { ...latestContract, end_date: today }],
      actualEndDate: latestContract.end_date,
    };
  }
  return {
    contracts: [...contracts, latestContract],
    actualEndDate: latestContract.end_date,
  };
}

/** Create `Length of Service` Calculator */
export function createLOSCalculator() {
  let counts = { years: 0, months: 0, days: 0 };
  let startDate = dateHelper.getISOToday;
  let endDate = dateHelper.getISOToday;
  let actualEndDate = dateHelper.getISOToday;

  /** Counts will reset if contracts is `undefined` or `null` */
  function calculate(contracts?: ContractBase[] | null, includeToday = true) {
    if (!contracts || !contracts.length) {
      counts = { years: 0, months: 0, days: 0 };
      return counts;
    }

    contracts = sortContractsByStartDate(contracts);
    contracts = getStableRange(contracts);

    const effectiveDates = setEffectiveCutoffDate(contracts);
    contracts = effectiveDates.contracts;
    actualEndDate = effectiveDates.actualEndDate;

    let totalDays = 0;

    for (const c of contracts) {
      const start = new Date(c.start_date);
      let end = new Date(c.end_date);

      if (includeToday) {
        end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      }

      const diffMs = end.getTime() - start.getTime();
      if (diffMs <= 0) continue;

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      totalDays += days;
    }

    // Now convert the accumulated days into Y/M/D accurately.
    let cursor = new Date(0, 0, 1);
    let target = new Date(0, 0, 1 + totalDays);

    const years = target.getFullYear() - cursor.getFullYear();
    const months = target.getMonth() - cursor.getMonth();
    const days = target.getDate() - cursor.getDate();

    counts = { years: years, months: months, days: days };
    startDate = contracts[0].start_date;
    endDate = contracts[contracts.length - 1].end_date;

    return counts;
  }

  return {
    get counts() {
      return counts;
    },
    get startDate() {
      return startDate;
    },
    get endDate() {
      return endDate;
    },
    get actualEndDate() {
      return actualEndDate;
    },
    calculate,
  };
}
