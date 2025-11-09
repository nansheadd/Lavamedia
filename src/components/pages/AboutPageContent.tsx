'use client';

import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTranslationList, useTranslations } from '@/contexts/language-context';

export function AboutPageContent() {
  const t = useTranslations();
  const paragraphs = useTranslationList<string[]>('about.paragraphs');

  return (
    <Container className="prose prose-slate py-16 dark:prose-invert">
      <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </Container>
  );
}
