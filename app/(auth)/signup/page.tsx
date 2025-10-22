'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { signup, user, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace('/espace');
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    try {
      await signup({ email, password, fullName });
      router.replace('/espace');
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de créer le compte. Veuillez réessayer.";
      setError(message);
    }
  };

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <SectionHeading
          eyebrow="Nouveau sur Lavamedia"
          title="Créer un compte"
          description="Rejoignez la communauté et accédez à votre tableau de bord personnalisé."
        />
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="Nom complet"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Alex Journaliste"
          />
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="Au moins 8 caractères pour sécuriser votre accès."
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="passwordConfirmation"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Création en cours…' : 'Créer mon compte'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
          Vous avez déjà un compte ?{' '}
          <Link href="/auth/login" className="font-semibold text-primary-600 hover:underline">
            Connectez-vous ici
          </Link>
        </p>
      </div>
    </Container>
  );
}
