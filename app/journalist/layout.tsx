"use client";

import { Container } from '@/components/layout/container';
import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { href: '/journalist', label: 'Dashboard' },
  { href: '/journalist/brouillons', label: 'Brouillons' },
  { href: '/journalist/editeur', label: 'Éditeur' },
  { href: '/journalist/workflow', label: 'Workflow' },
  { href: '/journalist/mediatheque', label: 'Médiathèque' }
];

export default function JournalistLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-950">
      <Container>
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-slate-100/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
            <nav className="flex flex-wrap gap-3 text-sm font-semibold">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'rounded-full px-3 py-1 text-slate-600 transition hover:bg-white hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-900',
                    pathname?.startsWith(item.href) && 'bg-white text-primary-600 dark:bg-slate-900 dark:text-primary-300'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </Container>
    </div>
  );
}
