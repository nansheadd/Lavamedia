'use client';

import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { SubscriptionFlow } from '@/components/subscriptions/SubscriptionFlow';
import { useTranslationList, useTranslations } from '@/contexts/language-context';

type SubscriptionHighlight = {
  title: string;
  description: string;
  icon?: string;
};

export function SubscriptionPageContent() {
  const t = useTranslations();
  const highlights = useTranslationList<SubscriptionHighlight[]>('subscriptions.highlights');

  return (
    <div className="py-16">
      <Container className="space-y-10">
        <div className="grid gap-10 lg:grid-cols-[3fr,2fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={t('subscriptions.eyebrow')}
              title={t('subscriptions.title')}
              description={t('subscriptions.longDescription')}
            />
            <div className="mt-8 grid gap-4">
              {highlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className="rounded-3xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{highlight.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-slate-50 p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">
              {t('subscriptions.stickyTitle')}
            </p>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-200">{t('subscriptions.stickyDescription')}</p>
          </div>
        </div>
        <SubscriptionFlow layout="full" />
      </Container>
    </div>
  );
}
