'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from '@/contexts/language-context';

export default function PrivateSpacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Container className="py-16">
        <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">
          {t('privateSpace.loading')}
        </p>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  const editorialRoles = new Set(['author', 'editor', 'admin']);
  const isAuthor = user.primaryRole === 'author';
  const canAccessStudio = editorialRoles.has(user.primaryRole);
  const benefits = [
    {
      title: t('privateSpace.benefits.accountStatus'),
      description: user.primaryRole === 'admin'
        ? t('privateSpace.benefits.admin')
        : isAuthor
          ? t('privateSpace.benefits.author')
          : t('privateSpace.benefits.reader')
    },
    {
      title: t('privateSpace.benefits.email'),
      description: user.email
    },
    {
      title: t('privateSpace.benefits.roles'),
      description: user.roles.length > 0 ? user.roles.join(', ') : t('privateSpace.benefits.none')
    }
  ];

  const nextStepLink = user.primaryRole === 'admin' ? '/admin' : canAccessStudio ? '/journalist' : '/';
  const nextStepLabel =
    user.primaryRole === 'admin'
      ? t('privateSpace.next.admin')
      : canAccessStudio
        ? t('privateSpace.next.author')
        : t('privateSpace.next.reader');

  return (
    <Container className="py-16">
      <div className="space-y-10">
        <SectionHeading
          eyebrow={t('privateSpace.eyebrow')}
          title={t('privateSpace.greeting', { name: user.fullName ?? user.email })}
          description={t('privateSpace.description')}
        />
        {canAccessStudio ? (
          <div className="rounded-3xl border border-primary-100 bg-primary-50/70 p-6 shadow-sm dark:border-primary-700 dark:bg-primary-900/40">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
              {t('privateSpace.studio.title')}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {t('privateSpace.studio.description')}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/journalist/editeur">{t('privateSpace.studio.openEditor')}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/journalist/brouillons">{t('privateSpace.studio.manageDrafts')}</Link>
              </Button>
            </div>
          </div>
        ) : null}
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-white/80 backdrop-blur dark:bg-slate-900/80">
              <CardTitle>{benefit.title}</CardTitle>
              <CardDescription>{benefit.description}</CardDescription>
            </Card>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-slate-50 p-8 shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('privateSpace.next.title')}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('privateSpace.next.description')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={nextStepLink}>{nextStepLabel}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/newsletter">{t('privateSpace.next.manageNewsletters')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
