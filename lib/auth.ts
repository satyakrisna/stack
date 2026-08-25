import { createHash, randomBytes, randomUUID } from 'crypto';
import { and, eq, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { sessions, tokens, users } from '@/db/schema';
import { db } from './db';

const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-stack_session' : 'stack_session';
const SESSION_DAYS = 30;
const TOKEN_HOURS = 1;

export const hashToken = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export async function user() {
  const rawToken = (await cookies()).get(COOKIE)?.value;
  if (!rawToken) return null;
  const rows = await db()
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(rawToken)),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function requireUser() {
  const current = await user();
  if (!current) throw new Error('UNAUTHORIZED');
  return current;
}

export async function signIn(userId: string) {
  const rawToken = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db().insert(sessions).values({
    id: randomUUID(),
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt,
  });
  (await cookies()).set(COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function signOut() {
  const store = await cookies();
  const rawToken = store.get(COOKIE)?.value;
  if (rawToken) {
    await db().delete(sessions).where(eq(sessions.tokenHash, hashToken(rawToken)));
  }
  store.delete(COOKIE);
}

export async function makeToken(userId: string, kind: 'verify' | 'reset') {
  const rawToken = randomBytes(32).toString('base64url');
  await db().delete(tokens).where(and(eq(tokens.userId, userId), eq(tokens.kind, kind)));
  await db().insert(tokens).values({
    id: randomUUID(),
    userId,
    kind,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + TOKEN_HOURS * 3_600_000),
  });
  return rawToken;
}
