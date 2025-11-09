'use client';

import { Suspense } from 'react';
import { SectionHeading } from '@/components/ui/section-heading';
import { EditorScreen } from '@/components/journalist/EditorScreen';
import { useTranslations } from '@/contexts/language-context';

export function JournalistEditorContent() {
  const t = useTranslations();

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={t('editorPage.eyebrow')}
        title={t('editorPage.title')}
        description={t('editorPage.description')}
      />
      <Suspense
        fallback={
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            {t('editorPage.loadingFallback', { defaultValue: 'Chargement du studio…' })}
          </div>
        }
      >
        <EditorScreen />
      </Suspense>
    </div>
  );
}
