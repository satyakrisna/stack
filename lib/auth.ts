import { cookies } from 'next/headers'; import { createHash,randomBytes,randomUUID } from 'crypto'; import { db } from './db'; import { sessions,users,tokens } from '@/db/schema'; import { and,eq,gt } from 'drizzle-orm';
const COOKIE='stack_session',hash=(x:string)=>createHash('sha256').update(x).digest('hex');
export async function user(){const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const rows=await db().select({user:users}).from(sessions).innerJoin(users,eq(sessions.userId,users.id)).where(and(eq(sessions.tokenHash,hash(token)),gt(sessions.expiresAt,new Date()))).limit(1);return rows[0]?.user??null}
export async function requireUser(){const u=await user();if(!u)throw new Error('UNAUTHORIZED');return u}
export async function signIn(userId:string){const raw=randomBytes(32).toString('base64url'),expires=new Date(Date.now()+30*864e5);await db().insert(sessions).values({id:randomUUID(),userId,tokenHash:hash(raw),expiresAt:expires});(await cookies()).set(COOKIE,raw,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires})}
export async function signOut(){const c=await cookies(),raw=c.get(COOKIE)?.value;if(raw)await db().delete(sessions).where(eq(sessions.tokenHash,hash(raw)));c.delete(COOKIE)}
export async function makeToken(userId:string,kind:string){const raw=randomBytes(32).toString('base64url');await db().insert(tokens).values({id:randomUUID(),userId,kind,tokenHash:hash(raw),expiresAt:new Date(Date.now()+3600e3)});return raw}
export {hash};
