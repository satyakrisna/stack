import { Nav } from '@/components/nav';
import { requireUser } from '@/lib/auth';
import { dateAdd, localDate } from '@/lib/date';
import { allHistory } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const account = await requireUser();
  const rows = await allHistory(account.id);
  const today = localDate(new Date(), account.timezone);
  const currentMonth = today.slice(0, 7);
  const monthRows = rows.filter((row) => row.entry.entryDate.startsWith(currentMonth));
  const groups = rows.reduce<Record<string, typeof rows>>((result, row) => {
    (result[row.entry.entryDate] ??= []).push(row);
    return result;
  }, {});
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => dateAdd(today, index - 6));
  const dailyCounts = lastSevenDays.map((date) => rows.filter((row) => row.entry.entryDate === date).length);
  const peak = Math.max(1, ...dailyCounts);

  return (
    <main className="app">
      <h1 className="brand">HISTORY</h1>
      <section className="card history-summary">
        <span className="eyebrow">THIS MONTH</span>
        <div className="history-number">{monthRows.length}</div>
        <span className="eyebrow">PROOF STACKED</span>
        <div className="bars" aria-label="Proof stacked over the last seven local days">
          {dailyCounts.map((count, index) => (
            <span key={lastSevenDays[index]} style={{ height: `${Math.max(12, (count / peak) * 100)}%` }} title={`${lastSevenDays[index]}: ${count}`} />
          ))}
        </div>
      </section>
      {!rows.length && (
        <div className="empty"><h2>NO PROOF YET</h2><p className="subtle">Completed stacks will appear here.</p></div>
      )}
      {Object.entries(groups).map(([date, entries]) => (
        <section className="card history-day" key={date}>
          <h2>{date}</h2>
          {entries.map((row) => (
            <div className="listrow" key={row.entry.id}><span>{row.stack.name}</span><span className="success" aria-label="Completed">✓</span></div>
          ))}
        </section>
      ))}
      <Nav />
    </main>
  );
}
