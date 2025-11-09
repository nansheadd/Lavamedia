'use client';

import { useState } from 'react';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/contexts/language-context';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const t = useTranslations();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus('success');
      setMessage(t('newsletterForm.success'));
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(t('newsletterForm.error'));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <Input
        label={t('newsletterForm.emailLabel')}
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        hint={t('newsletterForm.hint')}
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? t('newsletterForm.loading') : t('newsletterForm.submit')}
      </Button>
      {status !== 'idle' ? (
        <p className="text-sm" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
