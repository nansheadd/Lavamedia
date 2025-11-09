'use client';

import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { NewsletterForm } from '@/components/forms/newsletter-form';
import { useTranslations } from '@/contexts/language-context';

export function NewsletterPageContent() {
  const t = useTranslations();

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={t('newsletter.eyebrow')}
        title={t('newsletter.title')}
        description={t('newsletter.description')}
        align="center"
      />
      <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <NewsletterForm />
      </div>
    </Container>
  );
}
