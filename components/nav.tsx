import Link from 'next/link';import {CalendarDays,History,Plus} from 'lucide-react';
export function Nav(){return <nav className="nav" aria-label="Primary"><Link href="/"><CalendarDays size={19}/><br/>TODAY</Link><Link className="round plus" href="/stack/new" aria-label="Create stack"><Plus/></Link><Link href="/history"><History size={19}/><br/>HISTORY</Link></nav>}
