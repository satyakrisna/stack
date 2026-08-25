import { pgTable, text, timestamp, date, integer, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const frequency = pgEnum('frequency', ['DAILY', 'WEEKLY']);
export const users = pgTable('users', {
  id: text('id').primaryKey(), email: text('email').notNull().unique(), name: text('name'),
  passwordHash: text('password_hash').notNull(), timezone: text('timezone').notNull().default('UTC'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone:true }), onboardingComplete: timestamp('onboarding_complete', {withTimezone:true}),
  createdAt: timestamp('created_at',{withTimezone:true}).notNull().defaultNow(), updatedAt: timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),
});
export const sessions = pgTable('sessions', {id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),tokenHash:text('token_hash').notNull().unique(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()}, t=>[index('session_user_idx').on(t.userId)]);
export const tokens = pgTable('auth_tokens',{id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),kind:text('kind').notNull(),tokenHash:text('token_hash').notNull().unique(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()},t=>[index('auth_token_user_kind_idx').on(t.userId,t.kind)]);
export const stacks = pgTable('stacks',{id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),name:text('name').notNull(),description:text('description'),frequency:frequency('frequency').notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),archivedAt:timestamp('archived_at',{withTimezone:true})},t=>[index('stack_user_idx').on(t.userId)]);
export const stackEntries = pgTable('stack_entries',{id:text('id').primaryKey(),stackId:text('stack_id').notNull().references(()=>stacks.id,{onDelete:'cascade'}),entryDate:date('entry_date',{mode:'string'}).notNull(),completedAt:timestamp('completed_at',{withTimezone:true}).notNull().defaultNow(),value:integer('value').notNull().default(1),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()},t=>[uniqueIndex('stack_entry_stack_date_unique').on(t.stackId,t.entryDate),index('entry_stack_idx').on(t.stackId)]);
