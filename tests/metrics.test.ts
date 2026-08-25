import { describe, expect, it } from 'vitest';
import { calculateGlobalMetrics, calculateStackMetrics } from '@/lib/metrics';

const daily = (entries: string[], today = '2026-08-20', created = '2026-08-17') =>
  calculateStackMetrics(entries, 'DAILY', today, created);

describe('daily streaks', () => {
  it('returns zero with no entries', () => expect(daily([]).currentStreak).toBe(0));
  it('counts a completion today', () => expect(daily(['2026-08-20']).currentStreak).toBe(1));
  it('preserves yesterday while today is unfinished', () => expect(daily(['2026-08-19']).currentStreak).toBe(1));
  it('extends through yesterday and today', () => expect(daily(['2026-08-19', '2026-08-20']).currentStreak).toBe(2));
  it('resets when yesterday was missed', () => expect(daily(['2026-08-18']).currentStreak).toBe(0));
  it('starts after the latest historical gap', () => expect(daily([
    '2026-08-12', '2026-08-13', '2026-08-17', '2026-08-18', '2026-08-19',
  ]).currentStreak).toBe(3));
  it('keeps best streak independent from current', () => expect(daily([
    '2026-08-10', '2026-08-11', '2026-08-12', '2026-08-20',
  ], '2026-08-20', '2026-08-10')).toMatchObject({ currentStreak: 1, bestStreak: 3 }));
  it('normalizes duplicate dates safely', () => expect(daily([
    '2026-08-20', '2026-08-20',
  ]).lifetimeProof).toBe(1));
});

describe('stack rate', () => {
  it('does not count the active unfinished day as a failure', () => expect(daily([
    '2026-08-17', '2026-08-19',
  ], '2026-08-20').stackRate).toBe(67));
  it('includes the active day when it succeeds', () => expect(daily([
    '2026-08-17', '2026-08-19', '2026-08-20',
  ], '2026-08-20').stackRate).toBe(75));
  it('has no eligible period for a new unfinished stack', () => expect(daily(
    [], '2026-08-20', '2026-08-20',
  ).stackRate).toBe(0));
});

describe('weekly streaks', () => {
  const weekly = (entries: string[], today = '2026-08-20') =>
    calculateStackMetrics(entries, 'WEEKLY', today, '2026-07-27');
  it('returns zero with no entries', () => expect(weekly([]).currentStreak).toBe(0));
  it('makes the active week successful with one completion', () => expect(weekly(['2026-08-18']).currentStreak).toBe(1));
  it('preserves the prior streak through an unfinished active week', () => expect(weekly([
    '2026-08-04', '2026-08-11',
  ]).currentStreak).toBe(2));
  it('counts one successful period for multiple entries in a week', () => expect(weekly([
    '2026-08-17', '2026-08-18',
  ]).currentStreak).toBe(1));
  it('resets after a missed completed prior week', () => expect(weekly([
    '2026-08-04',
  ]).currentStreak).toBe(0));
  it('finds a historical weekly best', () => expect(weekly([
    '2026-07-28', '2026-08-04', '2026-08-18',
  ]).bestStreak).toBe(2));
  it('accepts timezone-local dates at the Monday boundary', () => expect(weekly([
    '2026-08-10', '2026-08-17',
  ], '2026-08-17').currentStreak).toBe(2));
});

it('calculates global lifetime and current proof', () => expect(calculateGlobalMetrics([
  daily(['2026-08-20']), daily(['2026-08-19']),
])).toEqual({ lifetimeProof: 2, currentProof: 2 }));
