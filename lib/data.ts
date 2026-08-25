import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';
import { stackEntries, stacks } from '@/db/schema';
import { localDate, weekKey } from './date';
import { db } from './db';
import { calculateStackMetrics } from './metrics';

export async function dashboard(userId: string, timeZone: string) {
  const stackList = await db().select().from(stacks).where(and(
    eq(stacks.userId, userId), isNull(stacks.archivedAt),
  )).orderBy(asc(stacks.createdAt));
  const stackIds = stackList.map((stack) => stack.id);
  const entries = stackIds.length
    ? await db().select().from(stackEntries).where(inArray(stackEntries.stackId, stackIds))
    : [];
  const today = localDate(new Date(), timeZone);

  return stackList.map((stack) => {
    const dates = entries.filter((entry) => entry.stackId === stack.id).map((entry) => entry.entryDate);
    const completed = stack.frequency === 'DAILY'
      ? dates.includes(today)
      : dates.some((date) => weekKey(date) === weekKey(today));
    return {
      ...stack,
      entries: dates,
      metrics: calculateStackMetrics(
        dates, stack.frequency, today, localDate(stack.createdAt, timeZone),
      ),
      completed,
    };
  });
}

export async function allHistory(userId: string) {
  return db().select({ entry: stackEntries, stack: stacks }).from(stackEntries).innerJoin(
    stacks, and(eq(stackEntries.stackId, stacks.id), eq(stacks.userId, userId)),
  ).orderBy(desc(stackEntries.entryDate));
}
