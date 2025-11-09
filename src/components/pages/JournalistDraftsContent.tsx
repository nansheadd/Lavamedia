'use client';

import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateArticleForm } from '@/components/journalist/CreateArticleForm';
import { JournalistAccessGuard } from '@/components/journalist/JournalistAccessGuard';
import { useLanguage, useTranslationList, useTranslations } from '@/contexts/language-context';

export function JournalistDraftsContent() {
  const t = useTranslations();
  const { language } = useLanguage();
  const drafts = useTranslationList<Array<{ title: string; updatedAt: string; status: string; owner: string }>>('drafts.drafts');
  const locale = language === 'nl' ? 'nl-NL' : 'fr-FR';

  return (
    <div className="space-y-10">
      <JournalistAccessGuard>
        <SectionHeading
          eyebrow={t('drafts.eyebrow')}
          title={t('drafts.title')}
          description={t('drafts.description')}
        />
        <CreateArticleForm />
        <div className="grid gap-6">
          {drafts.map((draft) => (
            <Card key={draft.title}>
              <CardTitle>{draft.title}</CardTitle>
              <CardDescription>{draft.owner}</CardDescription>
              <CardFooter>
                <p className="text-xs text-slate-500">
                  {t('draftsList.updated', { date: new Date(draft.updatedAt).toLocaleString(locale) })}
                </p>
                <Button variant="ghost">{t('drafts.open')}</Button>
              </CardFooter>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary-500">{draft.status}</p>
            </Card>
          ))}
        </div>
      </JournalistAccessGuard>
    </div>
  );
}
