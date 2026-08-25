import { and, asc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { archiveStack } from '@/actions/actions';
import { CompletionButton } from '@/components/completion-button';
import { Nav } from '@/components/nav';
import { StackProgress } from '@/components/progress';
import { stackEntries, stacks } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { dateAdd, dayOfMonth, labelDate, localDate, weekKey } from '@/lib/date';
import { db } from '@/lib/db';
import { calculateStackMetrics } from '@/lib/metrics';
import { assertOwnership } from '@/lib/ownership';

export const dynamic = 'force-dynamic';

export default async function StackDetail({ params }: { params: Promise<{ id: string }> }) {
  const account = await requireUser();
  const { id } = await params;
  const stack = (await db().select().from(stacks).where(and(
    eq(stacks.id, id), eq(stacks.userId, account.id),
  )).limit(1))[0];
  if (!stack) notFound();
  assertOwnership(stack.userId, account.id);

  const entries = await db().select().from(stackEntries)
    .where(eq(stackEntries.stackId, id)).orderBy(asc(stackEntries.entryDate));
  const today = localDate(new Date(), account.timezone);
  const dates = entries.map((entry) => entry.entryDate);
  const metrics = calculateStackMetrics(
    dates, stack.frequency, today, localDate(stack.createdAt, account.timezone),
  );
  const activeKey = stack.frequency === 'DAILY' ? today : weekKey(today);
  const completed = stack.frequency === 'DAILY'
    ? dates.includes(today)
    : dates.some((date) => weekKey(date) === activeKey);
  const previousKey = dateAdd(activeKey, stack.frequency === 'DAILY' ? -1 : -7);
  const broken = dates.length > 0 && !completed && metrics.currentStreak === 0 &&
    !dates.some((date) => (stack.frequency === 'DAILY' ? date : weekKey(date)) === previousKey);
  const recentDays = Array.from({ length: 35 }, (_, index) => dateAdd(today, index - 34));

  return (
    <main className="app">
      <header className="top">
        <Link className="back" href="/" aria-label="Back to today">‹</Link>
        <h1 className="brand">{stack.name}</h1><span className="iconbtn-spacer" />
      </header>

      {broken && (
        <section className="broken-panel" aria-labelledby="broken-heading">
          <h2 id="broken-heading">STACK BROKEN</h2>
          <p className="subtle">The data changed. Nothing else.</p>
          <div className="card broken-card">
            <b>{stack.name.toUpperCase()}</b>
            <div className="broken-number">{metrics.bestStreak} → 0</div>
            <p>{metrics.lifetimeProof} lifetime proof remains.</p>
            <p className="subtle">Missed: {labelDate(previousKey)}</p>
          </div>
        </section>
      )}

      <p className="eyebrow center">{completed ? 'PROOF ADDED TODAY' : 'CURRENT STACK'}</p>
      <div className="big-stack">{metrics.currentStreak}</div>
      <p className="eyebrow center">{stack.frequency === 'DAILY' ? 'DAYS' : 'WEEKS'}</p>
      {completed && <p className="center success completion-copy">+1 proof added today</p>}
      <StackProgress count={metrics.currentStreak} />

      <div className="stats detail-stats">
        <div className="card stat"><span className="eyebrow">BEST</span><b>{metrics.bestStreak}</b><span className="eyebrow">{stack.frequency === 'DAILY' ? 'DAYS' : 'WEEKS'}</span></div>
        <div className="card stat"><span className="eyebrow">LIFETIME</span><b>{metrics.lifetimeProof}</b><span className="eyebrow">PROOF</span></div>
        <div className="card stat"><span className="eyebrow">STACK RATE</span><b>{metrics.stackRate}%</b></div>
        <div className="card stat"><span className="eyebrow">FREQUENCY</span><b className="frequency-value">{stack.frequency}</b></div>
      </div>
      <section className="card calendar-card">
        <h2 className="eyebrow center">RECENT PROOF</h2>
        <div className="calendar" role="grid" aria-label="Recent completion calendar">
          {recentDays.map((date) => {
            const hasProof = dates.includes(date);
            return <span key={date} role="gridcell" aria-label={`${date}: ${hasProof ? 'completed' : 'not completed'}`}>{hasProof ? <b>●</b> : dayOfMonth(date)}</span>;
          })}
        </div>
      </section>
      {stack.archivedAt ? (
        <p className="card archived-state">This stack is archived. Lifetime proof remains.</p>
      ) : <CompletionButton id={id} name={stack.name} completed={completed} broken={broken} />}
      <form action={archiveStack.bind(null, id)}>
        <button className="button secondary" disabled={Boolean(stack.archivedAt)}>ARCHIVE STACK</button>
      </form>
      {broken && <Link className="button secondary" href="/history">VIEW HISTORY</Link>}
      <Nav />
    </main>
  );
}
