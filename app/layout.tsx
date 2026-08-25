import type { Metadata, Viewport } from 'next';
import { ServiceWorkerRegistration } from '@/components/service-worker';
import './globals.css';

export const metadata: Metadata = {
  title: 'STACK',
  description: 'Stack proof. One completion at a time.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'STACK', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = {
  themeColor: '#050505', width: 'device-width', initialScale: 1, viewportFit: 'cover',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<ServiceWorkerRegistration /></body></html>;
}
