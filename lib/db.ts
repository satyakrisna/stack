import { neon } from '@neondatabase/serverless'; import { drizzle } from 'drizzle-orm/neon-http'; import * as schema from '@/db/schema';
export function db(){ if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required'); return drizzle(neon(process.env.DATABASE_URL),{schema}); }
