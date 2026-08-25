import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from '@/lib/db';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
await migrate(db(), { migrationsFolder: 'db/migrations' });
