import Link from 'next/link';
import { changePassword } from '@/actions/actions';
import { ActionForm } from '@/components/action-form';
import { requireUser } from '@/lib/auth';

export default async function PasswordPage() {
  await requireUser();
  return (
    <main className="app">
      <Link className="back" href="/settings/account" aria-label="Back to account and security">‹</Link>
      <h1 className="auth-title">Change password</h1>
      <p className="subtle">All signed-in devices will be signed out.</p>
      <ActionForm action={changePassword} label="CHANGE PASSWORD">
        <label className="field">Current password<input name="currentPassword" type="password" required autoComplete="current-password" /></label>
        <label className="field">New password<input name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" /></label>
        <label className="field">Confirm new password<input name="confirm" type="password" minLength={8} maxLength={128} required autoComplete="new-password" /></label>
      </ActionForm>
    </main>
  );
}
