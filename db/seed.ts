import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { stackEntries, stacks, users } from './schema';
import { dateAdd, localDate } from '@/lib/date';
import { db } from '@/lib/db';

const userId = randomUUID();
const today = localDate(new Date(), 'UTC');
await db().insert(users).values({
  id: userId,
  email: 'demo@stack.local',
  passwordHash: await hash('stackproof', 12),
  timezone: 'UTC',
  emailVerifiedAt: new Date(),
  onboardingComplete: new Date(),
});

for (const [name, current, total] of [
  ['Gym', 43, 120], ['Music', 21, 108], ['Build', 17, 96], ['Read', 38, 104],
] as const) {
  const stackId = randomUUID();
  await db().insert(stacks).values({
    id: stackId,
    userId,
    name,
    frequency: 'DAILY',
    description: `Build proof through ${name.toLowerCase()}.`,
    createdAt: new Date(Date.now() - (total + 100) * 86_400_000),
  });
  const recent = Array.from({ length: current }, (_, index) => dateAdd(today, index - current + 1));
  const historical = Array.from({ length: total - current }, (_, index) => dateAdd(today, -current - 15 - index * 2));
  await db().insert(stackEntries).values([...historical, ...recent].map((entryDate) => ({
    id: randomUUID(), stackId, entryDate,
  })));
}
