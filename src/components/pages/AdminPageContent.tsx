'use client';

import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useTranslationList, useTranslations } from '@/contexts/language-context';

export function AdminPageContent() {
  const t = useTranslations();
  const insights = useTranslationList<Array<{ label: string; value: string; insight: string }>>('admin.insights');

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={t('admin.eyebrow')}
        title={t('admin.title')}
        description={t('admin.description')}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {insights.map((item) => (
          <Card key={item.label} className="bg-slate-900 text-slate-50">
            <CardTitle>{item.value}</CardTitle>
            <CardDescription>{item.label}</CardDescription>
            <p className="mt-4 text-xs text-primary-300">{item.insight}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
