const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function assertCalendarDate(value: string): string {
  if (!DATE_RE.test(value)) throw new Error(`Invalid calendar date: ${value}`);
  return value;
}

/** Converts an instant to YYYY-MM-DD in an IANA timezone without server-local assumptions. */
export function localDate(at: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(at);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return assertCalendarDate(`${part('year')}-${part('month')}-${part('day')}`);
}

/** Calendar arithmetic is intentionally performed at UTC noon to avoid DST transitions. */
export function dateAdd(value: string, days: number): string {
  assertCalendarDate(value);
  const date = new Date(`${value}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** ISO calendar week key (Monday) for an already timezone-normalized local date. */
export function weekKey(value: string): string {
  assertCalendarDate(value);
  const date = new Date(`${value}T12:00:00.000Z`);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return dateAdd(value, -daysSinceMonday);
}

export function dayOfMonth(value: string): number {
  assertCalendarDate(value);
  return Number(value.slice(8, 10));
}

export function labelDate(value: string): string {
  assertCalendarDate(value);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00.000Z`));
}
