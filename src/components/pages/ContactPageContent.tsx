'use client';

import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Input } from '@/components/forms/input';
import { TextArea } from '@/components/forms/textarea';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/contexts/language-context';

export function ContactPageContent() {
  const t = useTranslations();

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        description={t('contact.description')}
      />
      <form className="mt-8 grid gap-6 sm:max-w-xl">
        <Input label={t('contact.name')} name="name" />
        <Input label={t('contact.email')} type="email" name="email" />
        <TextArea label={t('contact.message')} name="message" rows={6} />
        <Button type="submit">{t('contact.submit')}</Button>
      </form>
    </Container>
  );
}
