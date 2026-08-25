import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  EMAIL_WEBHOOK_URL: z.string().url().optional(),
  EMAIL_WEBHOOK_SECRET: z.string().min(16).optional(),
  EMAIL_FROM: z.string().optional(),
});

export function serverEnv() {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid server environment: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
  }
  if (
    result.data.NODE_ENV === 'production' &&
    (!result.data.EMAIL_WEBHOOK_URL || !result.data.EMAIL_WEBHOOK_SECRET || !result.data.EMAIL_FROM)
  ) {
    throw new Error('Production email delivery is not configured');
  }
  return result.data;
}
