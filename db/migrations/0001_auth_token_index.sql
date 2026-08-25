CREATE INDEX IF NOT EXISTS "auth_token_user_kind_idx"
  ON "auth_tokens" ("user_id", "kind");
