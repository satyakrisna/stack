import Link from 'next/link';
import { register } from '@/actions/actions';
import { ActionForm } from '@/components/action-form';

export default function RegisterPage() {
  return (
    <main className="app auth-screen">
      <Link className="back" href="/" aria-label="Back to welcome">‹</Link>
      <h1 className="auth-title">Create account</h1>
      <p className="subtle">Start stacking proof.</p>
      <ActionForm action={register} label="CREATE ACCOUNT">
        <label className="field">Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
        <label className="field">Password<input name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" placeholder="Enter password" /></label>
        <label className="field">Confirm password<input name="confirm" type="password" minLength={8} maxLength={128} required autoComplete="new-password" placeholder="Confirm password" /></label>
      </ActionForm>
      <p className="terms subtle">By creating an account, you agree to keep stacking proof responsibly.</p>
    </main>
  );
}
