'use client';

import { useEffect, useState } from 'react';
import { timezone } from '@/actions/actions';

export default function TimezonePage() {
  const [detected, setDetected] = useState('UTC');
  useEffect(() => setDetected(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'), []);
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: detected, timeZoneName: 'longOffset',
  }).formatToParts().find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
  return (
    <main className="app center timezone-screen">
      <h1 className="auth-title">Set your day</h1>
      <p className="subtle">We&apos;ll use this to set your daily<br />reset and proof window.</p>
      <form action={timezone}>
        <label className="field timezone-field">TIMEZONE
          <select name="timezone" value={detected} onChange={(event) => setDetected(event.target.value)}>
            {[detected, 'UTC', 'Asia/Jakarta', 'America/New_York', 'Europe/London'].filter((value, index, all) => all.indexOf(value) === index).map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <div className="card timezone-offset"><b>{offset}</b><br /><span className="subtle">You can change this later in Settings.</span></div>
        <button className="button primary">USE {detected.toUpperCase()}</button>
      </form>
    </main>
  );
}
