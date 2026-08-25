'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function InstallSettingsLink() {
  const [installed, setInstalled] = useState(true);
  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && navigator.standalone === true));
  }, []);
  if (installed) return null;
  return <Link className="listrow" href="/install"><span>⇩　Install STACK</span><span>›</span></Link>;
}
