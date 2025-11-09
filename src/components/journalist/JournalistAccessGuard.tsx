"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from '@/contexts/language-context';

const ALLOWED_ROLES = new Set(["author", "editor", "admin"]);

type JournalistAccessGuardProps = {
  children: ReactNode;
};

export function JournalistAccessGuard({ children }: JournalistAccessGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (!loading && user && !ALLOWED_ROLES.has(user.primaryRole)) {
      router.replace('/espace');
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        {t('guard.checking')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <p>{t('guard.requireLogin')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">{t('navigation.login')}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">{t('navigation.signup')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!ALLOWED_ROLES.has(user.primaryRole)) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
        <p>{t('guard.forbidden')}</p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/espace">{t('guard.backToSpace')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
