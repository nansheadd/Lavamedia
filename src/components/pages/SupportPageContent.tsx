'use client';

import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useTranslationList, useTranslations } from '@/contexts/language-context';

export function SupportPageContent() {
  const t = useTranslations();
  const faqs = useTranslationList<Array<{ question: string; answer: string }>>('support.faqs');

  return (
    <Container className="py-16">
      <SectionHeading eyebrow={t('support.eyebrow')} title={t('support.title')} />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {faqs.map((faq) => (
          <Card key={faq.question}>
            <CardTitle>{faq.question}</CardTitle>
            <CardDescription>{faq.answer}</CardDescription>
          </Card>
        ))}
      </div>
    </Container>
  );
}
