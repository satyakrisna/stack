import { describe, expect, it } from 'vitest';
import { dateAdd, localDate, weekKey } from '@/lib/date';

describe('timezone-local calendar boundaries', () => {
  it('derives different local days from the same instant', () => {
    const instant = new Date('2026-08-20T23:30:00.000Z');
    expect(localDate(instant, 'Asia/Jakarta')).toBe('2026-08-21');
    expect(localDate(instant, 'America/New_York')).toBe('2026-08-20');
  });
  it('uses the local date before deriving its week', () => {
    const instant = new Date('2026-08-16T18:30:00.000Z');
    expect(weekKey(localDate(instant, 'Asia/Jakarta'))).toBe('2026-08-17');
    expect(weekKey(localDate(instant, 'America/New_York'))).toBe('2026-08-10');
  });
  it('remains calendar-safe across US spring DST', () => {
    expect(dateAdd('2026-03-07', 1)).toBe('2026-03-08');
    expect(dateAdd('2026-03-08', 1)).toBe('2026-03-09');
    expect(localDate(new Date('2026-03-08T07:30:00.000Z'), 'America/New_York')).toBe('2026-03-08');
  });
  it('remains calendar-safe across US fall DST', () => {
    expect(dateAdd('2026-10-31', 1)).toBe('2026-11-01');
    expect(dateAdd('2026-11-01', 1)).toBe('2026-11-02');
  });
});
