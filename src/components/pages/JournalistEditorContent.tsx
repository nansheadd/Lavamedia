'use client';

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
      <EditorScreen />
    </div>
  );
}
