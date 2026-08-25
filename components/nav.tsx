import { CalendarDays, History, Plus } from 'lucide-react';
import Link from 'next/link';

export function Nav() {
  return (
    <nav className="nav" aria-label="Primary navigation">
      <Link href="/"><CalendarDays aria-hidden="true" /><span>TODAY</span></Link>
      <Link className="round nav-plus" href="/stack/new" aria-label="Create a new stack"><Plus /></Link>
      <Link href="/history"><History aria-hidden="true" /><span>HISTORY</span></Link>
    </nav>
  );
}
