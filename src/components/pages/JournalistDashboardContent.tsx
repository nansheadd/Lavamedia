'use client';

import Link from 'next/link';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslationList, useTranslations } from '@/contexts/language-context';

export function JournalistDashboardContent() {
  const t = useTranslations();
  const metrics = useTranslationList<Array<{ label: string; value: string; change: string }>>('journalist.metrics');

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={t('journalist.eyebrow')}
        title={t('journalist.title')}
        description={t('journalist.description')}
      />
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/journalist/editeur">{t('journalist.openEditor')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/journalist/brouillons">{t('journalist.createArticle')}</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="bg-gradient-to-br from-primary-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
          >
            <CardTitle>{metric.value}</CardTitle>
            <CardDescription>{metric.label}</CardDescription>
            <p className="mt-4 text-xs font-semibold text-emerald-600">{metric.change}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
