import Link from 'next/link';
import { InstallControl } from '@/components/install';
import { requireUser } from '@/lib/auth';
import { dashboard } from '@/lib/data';
import { calculateGlobalMetrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export default async function InstallPage() {
  const account = await requireUser();
  const items = await dashboard(account.id, account.timezone);
  const proof = calculateGlobalMetrics(items.map((item) => item.metrics)).lifetimeProof;
  return (
    <main className="app">
      <Link className="back" href="/settings" aria-label="Back to settings">‹</Link>
      <h1 className="brand install-title">INSTALL<br />STACK</h1>
      <p className="subtle">Put it on your home screen.</p>
      <div className="card install-preview">
        <b>STACK</b><hr />
        <div className="stats">
          <div><span className="eyebrow">LIFETIME PROOF</span><b>{proof}</b></div>
          <div><span className="eyebrow">TODAY</span><b>{items.filter((item) => item.completed).length}/{items.length}</b></div>
        </div>
      </div>
      <p className="eyebrow">ON IPHONE</p>
      <InstallControl />
    </main>
  );
}
