'use server';

import { compare, hash as hashPassword } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { and, eq, gt, gte, isNull, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sessions, stackEntries, stacks, tokens, users } from '@/db/schema';
import { hashToken, makeToken, requireUser, signIn, signOut } from '@/lib/auth';
import { dateAdd, localDate, weekKey } from '@/lib/date';
import { db } from '@/lib/db';
import { sendAuthEmail } from '@/lib/email';
import { assertOwnership } from '@/lib/ownership';

export type FormState = { error?: string; ok?: boolean } | null;
const credentials = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

function appUrl(path: string) {
  const origin = process.env.APP_URL ?? 'http://localhost:3000';
  if (process.env.NODE_ENV === 'production' && !process.env.APP_URL) {
    throw new Error('APP_URL is required in production');
  }
  return new URL(path, origin).toString();
}

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success || formData.get('password') !== formData.get('confirm')) {
    return { error: 'Use a valid email and matching password (8+ characters).' };
  }
  const existing = await db().select({ id: users.id }).from(users)
    .where(eq(users.email, parsed.data.email)).limit(1);
  if (existing.length) return { error: 'An account already exists for this email.' };

  const id = randomUUID();
  await db().insert(users).values({
    id,
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password, 12),
  });
  const token = await makeToken(id, 'verify');
  await sendAuthEmail({
    kind: 'verify', email: parsed.data.email,
    url: appUrl(`/verify-email?token=${encodeURIComponent(token)}`),
  });
  await signIn(id);
  redirect('/verify-email');
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Enter a valid email and password.' };
  const account = (await db().select().from(users)
    .where(eq(users.email, parsed.data.email)).limit(1))[0];
  if (!account || !(await compare(parsed.data.password, account.passwordHash))) {
    return { error: 'Email or password is incorrect.' };
  }
  await signIn(account.id);
  redirect(account.emailVerifiedAt ? (account.onboardingComplete ? '/' : '/onboarding') : '/verify-email');
}

export async function logout() {
  await signOut();
  redirect('/');
}

export async function forgot(_: FormState, formData: FormData): Promise<FormState> {
  const email = z.string().email().trim().toLowerCase().safeParse(formData.get('email'));
  if (email.success) {
    const account = (await db().select().from(users).where(eq(users.email, email.data)).limit(1))[0];
    if (account) {
      const token = await makeToken(account.id, 'reset');
      await sendAuthEmail({
        kind: 'reset', email: account.email,
        url: appUrl(`/reset-password?token=${encodeURIComponent(token)}`),
      });
    }
  }
  return { ok: true };
}

export async function reset(_: FormState, formData: FormData): Promise<FormState> {
  const password = z.string().min(8).max(128).safeParse(formData.get('password'));
  const rawToken = formData.get('token');
  if (!password.success || typeof rawToken !== 'string') {
    return { error: 'Password must contain 8–128 characters.' };
  }
  const token = (await db().select().from(tokens).where(and(
    eq(tokens.tokenHash, hashToken(rawToken)), eq(tokens.kind, 'reset'), gt(tokens.expiresAt, new Date()),
  )).limit(1))[0];
  if (!token) return { error: 'This reset link is invalid or expired.' };

  await db().update(users).set({
    passwordHash: await hashPassword(password.data, 12), updatedAt: new Date(),
  }).where(eq(users.id, token.userId));
  await db().delete(tokens).where(eq(tokens.id, token.id));
  await db().delete(tokens).where(and(eq(tokens.userId, token.userId), eq(tokens.kind, 'reset')));
  redirect('/login?reset=1');
}

export async function verify(rawToken: string) {
  const token = (await db().select().from(tokens).where(and(
    eq(tokens.tokenHash, hashToken(rawToken)), eq(tokens.kind, 'verify'), gt(tokens.expiresAt, new Date()),
  )).limit(1))[0];
  if (!token) return false;
  await db().update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, token.userId));
  await db().delete(tokens).where(eq(tokens.id, token.id));
  return true;
}

export async function resendVerification() {
  const account = await requireUser();
  if (account.emailVerifiedAt) return;
  const token = await makeToken(account.id, 'verify');
  await sendAuthEmail({
    kind: 'verify', email: account.email,
    url: appUrl(`/verify-email?token=${encodeURIComponent(token)}`),
  });
  revalidatePath('/verify-email');
}

export async function timezone(formData: FormData) {
  const account = await requireUser();
  const timeZone = z.string().refine((value) => {
    try { new Intl.DateTimeFormat('en-US', { timeZone: value }); return true; }
    catch { return false; }
  }).parse(formData.get('timezone'));
  await db().update(users).set({
    timezone: timeZone, onboardingComplete: new Date(), updatedAt: new Date(),
  }).where(eq(users.id, account.id));
  redirect('/');
}

export async function createStack(_: FormState, formData: FormData): Promise<FormState> {
  const account = await requireUser();
  const parsed = z.object({
    name: z.string().trim().min(1).max(40),
    description: z.string().trim().max(160),
    frequency: z.enum(['DAILY', 'WEEKLY']),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Add a name and choose a frequency.' };
  await db().insert(stacks).values({
    id: randomUUID(), userId: account.id, ...parsed.data,
    description: parsed.data.description || null,
  });
  redirect('/');
}

export async function completeStack(id: string) {
  const account = await requireUser();
  const stack = (await db().select().from(stacks).where(and(
    eq(stacks.id, id), eq(stacks.userId, account.id), isNull(stacks.archivedAt),
  )).limit(1))[0];
  if (!stack) throw new Error('Stack not found');
  assertOwnership(stack.userId, account.id);

  const entryDate = localDate(new Date(), account.timezone);
  if (stack.frequency === 'WEEKLY') {
    const start = weekKey(entryDate);
    const existing = await db().select({ id: stackEntries.id }).from(stackEntries).where(and(
      eq(stackEntries.stackId, id), gte(stackEntries.entryDate, start),
      lte(stackEntries.entryDate, dateAdd(start, 6)),
    )).limit(1);
    if (existing.length) return;
  }
  // The unique (stack_id, entry_date) index is the final concurrency boundary.
  await db().insert(stackEntries).values({ id: randomUUID(), stackId: id, entryDate })
    .onConflictDoNothing({ target: [stackEntries.stackId, stackEntries.entryDate] });
  revalidatePath('/');
  revalidatePath(`/stack/${id}`);
  revalidatePath('/history');
}

export async function archiveStack(id: string) {
  const account = await requireUser();
  const stack = (await db().select({ userId: stacks.userId }).from(stacks).where(and(
    eq(stacks.id, id), eq(stacks.userId, account.id), isNull(stacks.archivedAt),
  )).limit(1))[0];
  if (!stack) throw new Error('Stack not found');
  assertOwnership(stack.userId, account.id);
  await db().update(stacks).set({ archivedAt: new Date(), updatedAt: new Date() }).where(and(
    eq(stacks.id, id), eq(stacks.userId, account.id), isNull(stacks.archivedAt),
  ));
  redirect('/');
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const account = await requireUser();
  const parsed = z.object({
    currentPassword: z.string().min(1),
    password: z.string().min(8).max(128),
    confirm: z.string(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.password !== parsed.data.confirm) {
    return { error: 'Use a matching new password with 8–128 characters.' };
  }
  if (!(await compare(parsed.data.currentPassword, account.passwordHash))) {
    return { error: 'Current password is incorrect.' };
  }
  await db().update(users).set({
    passwordHash: await hashPassword(parsed.data.password, 12), updatedAt: new Date(),
  }).where(eq(users.id, account.id));
  await db().delete(sessions).where(eq(sessions.userId, account.id));
  await signOut();
  redirect('/login?password=changed');
}

export async function deleteAccount(formData: FormData) {
  const account = await requireUser();
  if (formData.get('confirm') !== 'DELETE') throw new Error('Confirmation does not match');
  await db().delete(users).where(eq(users.id, account.id));
  // User deletion cascades the database session; signOut also clears the bearer cookie.
  await signOut();
  redirect('/');
}
