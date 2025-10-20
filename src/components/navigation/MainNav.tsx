'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Disclosure } from '@headlessui/react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/rubriques', label: 'Rubriques' },
  { href: '/recherche', label: 'Recherche' },
  { href: '/newsletter', label: 'Newsletter' }
] satisfies Array<{ href: Route; label: string }>;

export function MainNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Disclosure as="header" className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      {() => (
        <>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-lg font-bold text-primary-600">
                Lavamedia
              </Link>
              <nav className="hidden items-center gap-4 text-sm font-semibold sm:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'rounded-full px-3 py-1 transition',
                      pathname?.startsWith(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 sm:inline">
                    Bonjour, {user.name}
                  </span>
                  <Button onClick={() => void logout()} variant="ghost">
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link href="/journalist">Espace journaliste</Link>
                </Button>
              )}
              <Disclosure.Button className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:hidden">
                <span className="sr-only">Ouvrir le menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </Disclosure.Button>
            </div>
          </div>
          <Disclosure.Panel className="sm:hidden">
            <nav className="space-y-1 px-4 pb-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                    pathname?.startsWith(item.href) && 'bg-primary-100 text-primary-700'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
