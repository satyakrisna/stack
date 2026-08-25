import { dateAdd, weekKey } from './date';

export type Cadence = 'DAILY' | 'WEEKLY';
export type Metrics = {
  currentStreak: number;
  bestStreak: number;
  lifetimeProof: number;
  stackRate: number;
};

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function periodKeys(entries: string[], cadence: Cadence): string[] {
  return uniqueSorted(cadence === 'WEEKLY' ? entries.map(weekKey) : entries);
}

export function calculateStackMetrics(
  entries: string[],
  cadence: Cadence,
  today: string,
  created: string,
): Metrics {
  const keys = periodKeys(entries, cadence);
  const activePeriod = cadence === 'WEEKLY' ? weekKey(today) : today;
  const firstPeriod = cadence === 'WEEKLY' ? weekKey(created) : created;
  const step = cadence === 'WEEKLY' ? 7 : 1;
  const successful = new Set(keys);

  // The active day/week is not a failure. If it is unfinished, count back from
  // the last completed period; if successful, include it.
  let currentStreak = 0;
  let cursor = successful.has(activePeriod)
    ? activePeriod
    : dateAdd(activePeriod, -step);
  while (successful.has(cursor)) {
    currentStreak += 1;
    cursor = dateAdd(cursor, -step);
  }

  let bestStreak = 0;
  let run = 0;
  let previous: string | undefined;
  for (const key of keys) {
    run = previous && dateAdd(previous, step) === key ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = key;
  }

  // Only closed periods are eligible. The active period joins the denominator
  // when it succeeds, so an unfinished period never lowers the rate.
  const lastEligible = successful.has(activePeriod)
    ? activePeriod
    : dateAdd(activePeriod, -step);
  let eligiblePeriods = 0;
  for (let period = firstPeriod; period <= lastEligible; period = dateAdd(period, step)) {
    eligiblePeriods += 1;
  }

  return {
    currentStreak,
    bestStreak,
    lifetimeProof: uniqueSorted(entries).length,
    stackRate: eligiblePeriods
      ? Math.round((keys.filter((key) => key <= lastEligible).length / eligiblePeriods) * 100)
      : 0,
  };
}

export function calculateGlobalMetrics(items: Metrics[]) {
  return {
    lifetimeProof: items.reduce((total, item) => total + item.lifetimeProof, 0),
    currentProof: items.reduce((total, item) => total + item.currentStreak, 0),
  };
}
