import Link from 'next/link';
import { resendVerification, verify } from '@/actions/actions';
import { user } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token;
  const verified = token ? await verify(token) : false;
  const account = await user();
  return (
    <main className="app">
      <h1 className="auth-title">{verified ? 'Email verified' : 'Verify your email'}</h1>
      <div className="card empty email-state">
        <div className="email-icon" aria-hidden="true">✉</div>
        <h2>{verified ? 'You’re verified.' : 'Check your inbox'}</h2>
        <p className="subtle">{verified ? 'Your account is ready.' : <>Email sent to<br /><b>{account?.email ?? 'your address'}</b><br /><br />Open it to confirm this account.</>}</p>
      </div>
      {verified ? <Link className="button primary" href="/onboarding">CONTINUE</Link> : account ? (
        <form action={resendVerification}><button className="button primary">RESEND EMAIL</button></form>
      ) : <Link className="button primary" href="/login">BACK TO SIGN IN</Link>}
      {!verified && <Link className="button text-link" href="/register">Change email</Link>}
    </main>
  );
}
