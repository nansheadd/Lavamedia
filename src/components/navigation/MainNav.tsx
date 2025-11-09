"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Disclosure } from '@headlessui/react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';
import { useLanguage, useTranslationList, useTranslations } from '@/contexts/language-context';

const EDITORIAL_ROLES = new Set(['author', 'editor', 'admin']);

export function MainNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user, logout, loading } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const t = useTranslations();
  const baseNavItems = useTranslationList<Array<{ href: string; label: string }>>('navigation.navItems');
  const studioNavItems = useTranslationList<Array<{ href: string; label: string }>>('navigation.studioItems');

  useEffect(() => {
    setMounted(true);
  }, []);

  const activePath = mounted ? pathname : null;

  const dashboardHref = user
    ? user.primaryRole === 'admin'
      ? '/admin'
      : user.primaryRole === 'author'
        ? '/journalist'
        : '/espace'
    : '/login';

  const navItems =
    mounted && user && EDITORIAL_ROLES.has(user.primaryRole)
      ? [...baseNavItems, ...studioNavItems]
      : baseNavItems;

  const renderLanguageSwitcher = (variant: 'desktop' | 'mobile') => (
    <div className={clsx(variant === 'mobile' && 'w-full')}>
      <label className="sr-only" htmlFor={`language-switcher-${variant}`}>
        {t('common.languageSwitcher.label')}
      </label>
      <select
        id={`language-switcher-${variant}`}
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        className={clsx(
          'rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition focus:border-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
          variant === 'mobile' ? 'mt-2 w-full' : 'w-28'
        )}
        aria-label={t('common.languageSwitcher.label')}
      >
        {languages.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Disclosure as="header" className="border-b border-primary-200 bg-primary-50/95 backdrop-blur dark:border-primary-900/60 dark:bg-primary-900/80">
      {() => (
        <>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-lg font-bold text-primary-600">
                {t('navigation.brand')}
              </Link>
              <nav className="hidden items-center gap-4 text-sm font-semibold sm:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'rounded-full px-3 py-1 transition',
                      activePath?.startsWith(item.href)
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
              <LanguageSwitcher className="hidden sm:flex" />
              {user ? (
                <>
                  <span className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 sm:inline">
                    {t('navigation.greeting', { name: user.fullName ?? user.email })}
                  </span>
                  <Button asChild variant="secondary">
                    <Link href={dashboardHref}>{t('navigation.dashboard')}</Link>
                  </Button>
                  <Button onClick={() => void logout()} variant="ghost" disabled={loading}>
                    {t('navigation.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/login">{t('navigation.login')}</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">{t('navigation.signup')}</Link>
                  </Button>
                </>
              )}
              <div className="hidden sm:block">{renderLanguageSwitcher('desktop')}</div>
              <Disclosure.Button className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:hidden">
                <span className="sr-only">{t('navigation.toggleMenu')}</span>
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
                    activePath?.startsWith(item.href) && 'bg-primary-100 text-primary-700'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
              <div className="mb-4 sm:hidden">
                <LanguageSwitcher className="w-full justify-center" />
              </div>
              {user ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('navigation.loggedInAs', { name: user.fullName ?? user.email })}
                  </p>
                  <Link
                    href={dashboardHref}
                    className="block rounded-xl bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow transition hover:bg-primary-700"
                  >
                    {t('navigation.goToSpace')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-400"
                  >
                    {t('navigation.logout')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-400"
                  >
                    {t('navigation.login')}
                  </Link>
                  <Link
                    href="/signup"
                    className="block rounded-xl bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow transition hover:bg-primary-700"
                  >
                    {t('navigation.signup')}
                  </Link>
                </div>
              )}
              <div className="mt-4">{renderLanguageSwitcher('mobile')}</div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
