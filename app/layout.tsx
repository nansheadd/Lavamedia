import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import clsx from 'clsx';
import './globals.css';
import { Providers } from '@/contexts/Providers';
import { MainNav } from '@/components/navigation/MainNav';
import { Footer } from '@/components/navigation/Footer';
import { JsonLd } from '@/components/seo/json-ld';
import { organizationJsonLd } from '@/lib/structured-data';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.lavamedia.example'),
  title: {
    default: 'Lavamedia',
    template: '%s | Lavamedia'
  },
  description: 'Magazine numérique pour journalistes modernes et rédactions agiles.',
  openGraph: {
    title: 'Lavamedia',
    description: 'Magazine numérique pour journalistes modernes et rédactions agiles.',
    type: 'website',
    url: 'https://www.lavamedia.example',
    images: [
      {
        url: 'https://www.lavamedia.example/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lavamedia - informations en continu'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lavamedia'
  }
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={clsx(inter.className, 'min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950')}>
        <JsonLd data={organizationJsonLd()} />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
