import Link from 'next/link';
import { login } from '@/actions/actions';
import { ActionForm } from '@/components/action-form';

export default function LoginPage() {
  return (
    <main className="app auth-screen">
      <Link className="back" href="/" aria-label="Back to welcome">‹</Link>
      <h1 className="auth-title">Welcome back</h1>
      <p className="subtle">Continue where you left off.</p>
      <ActionForm action={login} label="SIGN IN">
        <label className="field">Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
        <label className="field">Password<input name="password" type="password" minLength={8} maxLength={128} required autoComplete="current-password" placeholder="Enter your password" /></label>
        <p className="forgot-link"><Link href="/forgot-password">Forgot password?</Link></p>
      </ActionForm>
      <p className="center auth-switch">No account? <Link href="/register">Create one</Link></p>
    </main>
  );
}
