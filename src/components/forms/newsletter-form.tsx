'use client';

import { useState } from 'react';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus('success');
      setMessage('Merci ! Vous êtes bien inscrit·e à notre newsletter.');
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Une erreur est survenue, veuillez réessayer.');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <Input
        label="Adresse e-mail"
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        hint="Recevez chaque semaine notre sélection éditoriale et les coulisses de la rédaction."
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Inscription…' : 'Je m’abonne'}
      </Button>
      {status !== 'idle' ? (
        <p className="text-sm" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
