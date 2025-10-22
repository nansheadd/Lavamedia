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
  const { user, logout, loading } = useAuth();

  const dashboardHref = user
    ? user.primaryRole === 'admin'
      ? '/admin'
      : user.primaryRole === 'journalist'
        ? '/journalist'
        : '/espace'
    : '/auth/login';

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
                    Bonjour, {user.fullName ?? user.email}
                  </span>
                  <Button asChild variant="secondary">
                    <Link href={dashboardHref}>Mon espace</Link>
                  </Button>
                  <Button onClick={() => void logout()} variant="ghost" disabled={loading}>
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/auth/login">Se connecter</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signup">Créer un compte</Link>
                  </Button>
                </>
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
            <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
              {user ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Connecté en tant que {user.fullName ?? user.email}
                  </p>
                  <Link
                    href={dashboardHref}
                    className="block rounded-xl bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow transition hover:bg-primary-700"
                  >
                    Accéder à mon espace
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-400"
                  >
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/auth/login"
                    className="block rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-400"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block rounded-xl bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow transition hover:bg-primary-700"
                  >
                    Créer un compte
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
