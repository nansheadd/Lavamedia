"use client";

import { Container } from '@/components/layout/container';
import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { href: '/admin', label: 'Vue d’ensemble' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs' },
  { href: '/admin/seo', label: 'SEO' },
  { href: '/admin/newsletter', label: 'Newsletter & publicité' },
  { href: '/admin/publicite', label: 'Partenariats' }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-slate-950 py-12 text-slate-100">
      <Container>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
          <div className="border-b border-slate-800 px-6 py-4">
            <nav className="flex flex-wrap gap-3 text-sm font-semibold">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'rounded-full bg-slate-800/60 px-3 py-1 text-slate-200 transition hover:bg-primary-600 hover:text-white',
                    pathname?.startsWith(item.href) && 'bg-primary-600 text-white'
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
