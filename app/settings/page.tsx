import Link from 'next/link';
import { InstallSettingsLink } from '@/components/install-settings-link';
import { Nav } from '@/components/nav';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const account = await requireUser();
  return (
    <main className="app">
      <h1 className="brand settings-title">SETTINGS</h1>
      <p className="eyebrow settings-section">PREFERENCES</p>
      <div className="card settings-card">
        <Link className="listrow" href="/onboarding/timezone"><span>◉　Timezone</span><span className="subtle">{account.timezone}　›</span></Link>
        <InstallSettingsLink />
        <Link className="listrow" href="/settings/archived"><span>▣　Archived stacks</span><span>›</span></Link>
      </div>
      <p className="eyebrow settings-section">ACCOUNT</p>
      <div className="card settings-card">
        <div className="listrow"><span>✉　Email</span><span className="subtle truncate">{account.email}</span></div>
        <Link className="listrow" href="/settings/account"><span>▣　Account &amp; security</span><span>›</span></Link>
      </div>
      <p className="center subtle version">STACK v0.1</p>
      <Nav />
    </main>
  );
}
