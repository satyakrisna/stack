import { and, desc, eq, isNotNull } from 'drizzle-orm';
import Link from 'next/link';
import { stacks } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ArchivedPage() {
  const account = await requireUser();
  const archived = await db().select().from(stacks).where(and(
    eq(stacks.userId, account.id), isNotNull(stacks.archivedAt),
  )).orderBy(desc(stacks.archivedAt));
  return (
    <main className="app">
      <Link className="back" href="/settings" aria-label="Back to settings">‹</Link>
      <h1 className="brand account-title">ARCHIVED<br />STACKS</h1>
      {!archived.length ? <div className="empty"><h2>NO ARCHIVED STACKS</h2><p className="subtle">Archived stacks will remain available here.</p></div> : (
        <div className="card settings-card account-actions">
          {archived.map((stack) => <Link className="listrow" href={`/stack/${stack.id}`} key={stack.id}><span>{stack.name}</span><span>›</span></Link>)}
        </div>
      )}
    </main>
  );
}
