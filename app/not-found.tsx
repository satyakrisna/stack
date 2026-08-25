import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="app center">
      <h1 className="brand">STACK</h1>
      <div className="empty">
        <h2>NOT FOUND</h2>
        <p className="subtle">This stack is unavailable or does not belong to you.</p>
        <Link className="button primary" href="/">BACK TO TODAY</Link>
      </div>
    </main>
  );
}
