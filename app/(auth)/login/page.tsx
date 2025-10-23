'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace('/espace');
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.replace('/espace');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connexion impossible. Vérifiez vos identifiants.';
      setError(message);
    }
  };

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <SectionHeading
          eyebrow="Bienvenue"
          title="Se connecter à Lavamedia"
          description="Accédez à votre espace personnel pour retrouver vos contenus et vos réglages."
        />
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="Adresse e-mail"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="font-semibold text-primary-600 hover:underline">
            Créez votre accès
          </Link>
        </p>
      </div>
    </Container>
  );
}
