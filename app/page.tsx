import { BookOpen, Dumbbell, Hammer, Music, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CompletionButton } from '@/components/completion-button';
import { Nav } from '@/components/nav';
import { StackProgress } from '@/components/progress';
import { user } from '@/lib/auth';
import { dashboard } from '@/lib/data';
import { calculateGlobalMetrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';
const icons = [Dumbbell, Music, Hammer, BookOpen];

export default async function Home() {
  const account = await user();
  if (!account) {
    return (
      <main className="app welcome-screen">
        <header className="welcome-mark">
          <h1 className="brand hero-brand">STACK</h1>
          <p className="center subtle">Proof compounds.</p>
        </header>
        <div className="welcome-copy">
          <h2 className="headline">STACK<br />WHAT<br />MATTERS.</h2>
          <p className="subtle">Build visible evidence of your progress.<br />One day, one action, one stack at a time.</p>
        </div>
        <div className="welcome-actions">
          <Link className="button primary" href="/register">CREATE ACCOUNT</Link>
          <Link className="button secondary" href="/login">I ALREADY HAVE AN ACCOUNT</Link>
        </div>
      </main>
    );
  }
  if (!account.emailVerifiedAt) redirect('/verify-email');
  if (!account.onboardingComplete) redirect('/onboarding');

  const items = await dashboard(account.id, account.timezone);
  const global = calculateGlobalMetrics(items.map((item) => item.metrics));
  return (
    <main className="app dashboard">
      <header className="top">
        <h1 className="brand">STACK</h1>
        <Link className="iconbtn" href="/settings" aria-label="Open settings"><Settings /></Link>
      </header>
      <div className="proof">{global.lifetimeProof.toLocaleString()}</div>
      <div className="eyebrow proof-label">LIFETIME PROOF</div>
      <div className="section-row"><span>TODAY</span><span>{items.filter((item) => item.completed).length} / {items.length}</span></div>
      {!items.length ? (
        <div className="card empty">
          <span className="empty-plus" aria-hidden="true"><Plus /></span>
          <h2>NO STACKS YET</h2>
          <p className="subtle">Create the first thing you want<br />to prove you can keep doing.</p>
          <Link className="button primary" href="/stack/new">+ CREATE FIRST STACK</Link>
        </div>
      ) : (
        <div className="stack-list">
          {items.map((stack, index) => {
            const Icon = icons[index % icons.length];
            return (
              <article className="card stack-card" key={stack.id}>
                <Link className="stack-icon" href={`/stack/${stack.id}`} aria-label={`View ${stack.name}`}><Icon /></Link>
                <Link className="stack-main" href={`/stack/${stack.id}`}>
                  <div className="stack-name">{stack.name}</div>
                  <StackProgress count={stack.metrics.currentStreak} />
                </Link>
                <div className="stack-action">
                  <span className="streak">{stack.metrics.currentStreak} {stack.frequency === 'DAILY' ? 'DAYS' : 'WEEKS'}</span>
                  <CompletionButton id={stack.id} name={stack.name} completed={stack.completed} compact />
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Nav />
    </main>
  );
}
