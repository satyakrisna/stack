import Link from 'next/link';
import { deleteAccount, logout } from '@/actions/actions';
import { Nav } from '@/components/nav';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const account = await requireUser();
  return (
    <main className="app">
      <Link className="back" href="/settings" aria-label="Back to settings">‹</Link>
      <h1 className="brand account-title">ACCOUNT &amp;<br />SECURITY</h1>
      <div className="card account-email">✉　{account.email}<p className={account.emailVerifiedAt ? 'success' : 'error'}>{account.emailVerifiedAt ? 'VERIFIED' : 'NOT VERIFIED'}</p></div>
      <div className="card settings-card account-actions">
        <Link className="listrow" href="/settings/account/password"><span>▣　Change password</span><span>›</span></Link>
        <form action={logout}><button className="list-button">↪　Sign out <span>›</span></button></form>
      </div>
      <div className="card danger danger-zone">
        <b>DANGER ZONE</b>
        <p>Permanently delete your account and all your data. This action cannot be undone.</p>
        <form action={deleteAccount}>
          <label className="field">Type DELETE to confirm<input name="confirm" required pattern="DELETE" autoComplete="off" /></label>
          <button className="button secondary delete-button">DELETE ACCOUNT</button>
        </form>
      </div>
      <Nav />
    </main>
  );
}
