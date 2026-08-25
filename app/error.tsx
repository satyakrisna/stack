'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="app center">
      <h1 className="brand">STACK</h1>
      <div className="empty">
        <h2>UNAVAILABLE</h2>
        <p className="subtle">STACK couldn&apos;t load. Check your connection and try again.</p>
        <button className="button primary" onClick={reset}>TRY AGAIN</button>
      </div>
    </main>
  );
}
