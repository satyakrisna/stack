'use client';

import { useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallControl() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const iosStandalone = 'standalone' in navigator && navigator.standalone === true;
    setStandalone(window.matchMedia('(display-mode: standalone)').matches || iosStandalone);
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', capture);
    return () => window.removeEventListener('beforeinstallprompt', capture);
  }, []);

  if (standalone) return <p className="success center" role="status">STACK is installed.</p>;
  return (
    <>
      {prompt && (
        <button className="button primary" onClick={async () => {
          await prompt.prompt();
          const choice = await prompt.userChoice;
          if (choice.outcome === 'accepted') setPrompt(null);
        }}>INSTALL STACK</button>
      )}
      <div className="card install-steps">
        <div className="listrow"><b>1</b><span>Tap Share</span></div>
        <div className="listrow"><b>2</b><span>Add to Home Screen</span></div>
        <div className="listrow"><b>3</b><span>Tap Add</span></div>
      </div>
    </>
  );
}

declare global {
  interface Navigator { standalone?: boolean }
}
