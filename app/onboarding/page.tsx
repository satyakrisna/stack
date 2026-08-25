import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <main className="app center proof-onboarding">
      <h1 className="auth-title">Stack proof.</h1>
      <p className="subtle">Not <u>motivation</u>. Evidence.</p>
      <div className="onboarding-number">01</div>
      <p className="subtle">Every completion adds one proof.<br />Miss the required cadence and<br />the current stack breaks.<br />Lifetime proof stays.</p>
      <Link className="button primary onboarding-continue" href="/onboarding/timezone">CONTINUE</Link>
    </main>
  );
}
