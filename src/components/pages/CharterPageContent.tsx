'use client';

import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTranslationList, useTranslations } from '@/contexts/language-context';

export function CharterPageContent() {
  const t = useTranslations();
  const commitments = useTranslationList<string[]>('charter.commitments');

  return (
    <Container className="prose prose-slate py-16 dark:prose-invert">
      <SectionHeading eyebrow={t('charter.eyebrow')} title={t('charter.title')} />
      <ul>
        {commitments.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Container>
  );
}
