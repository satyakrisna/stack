CREATE TYPE "frequency" AS ENUM ('DAILY','WEEKLY');
--> statement-breakpoint
CREATE TABLE "users" ("id" text PRIMARY KEY,"email" text UNIQUE NOT NULL,"name" text,"password_hash" text NOT NULL,"timezone" text DEFAULT 'UTC' NOT NULL,"email_verified_at" timestamptz,"onboarding_complete" timestamptz,"created_at" timestamptz DEFAULT now() NOT NULL,"updated_at" timestamptz DEFAULT now() NOT NULL);
--> statement-breakpoint
CREATE TABLE "sessions" ("id" text PRIMARY KEY,"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"token_hash" text UNIQUE NOT NULL,"expires_at" timestamptz NOT NULL,"created_at" timestamptz DEFAULT now() NOT NULL);
--> statement-breakpoint
CREATE TABLE "auth_tokens" ("id" text PRIMARY KEY,"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"kind" text NOT NULL,"token_hash" text UNIQUE NOT NULL,"expires_at" timestamptz NOT NULL,"created_at" timestamptz DEFAULT now() NOT NULL);
--> statement-breakpoint
CREATE TABLE "stacks" ("id" text PRIMARY KEY,"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"name" text NOT NULL,"description" text,"frequency" frequency NOT NULL,"created_at" timestamptz DEFAULT now() NOT NULL,"updated_at" timestamptz DEFAULT now() NOT NULL,"archived_at" timestamptz);
--> statement-breakpoint
CREATE TABLE "stack_entries" ("id" text PRIMARY KEY,"stack_id" text NOT NULL REFERENCES "stacks"("id") ON DELETE CASCADE,"entry_date" date NOT NULL,"completed_at" timestamptz DEFAULT now() NOT NULL,"value" integer DEFAULT 1 NOT NULL,"created_at" timestamptz DEFAULT now() NOT NULL);
--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "sessions"("user_id");
--> statement-breakpoint
CREATE INDEX "stack_user_idx" ON "stacks"("user_id");
--> statement-breakpoint
CREATE INDEX "entry_stack_idx" ON "stack_entries"("stack_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "stack_entry_stack_date_unique" ON "stack_entries"("stack_id","entry_date");
