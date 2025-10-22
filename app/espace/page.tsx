'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container } from '@/components/layout/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function PrivateSpacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Container className="py-16">
        <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">Chargement de votre espace…</p>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  const benefits = [
    {
      title: 'Statut du compte',
      description: user.primaryRole === 'user' ? 'Lecteur actif' : user.primaryRole === 'journalist' ? 'Journaliste confirmé' : 'Administrateur'
    },
    {
      title: 'E-mail',
      description: user.email
    },
    {
      title: 'Rôles associés',
      description: user.roles.length > 0 ? user.roles.join(', ') : 'Aucun rôle spécifique'
    }
  ];

  const nextStepLink = user.primaryRole === 'admin' ? '/admin' : user.primaryRole === 'journalist' ? '/journalist' : '/';
  const nextStepLabel = user.primaryRole === 'admin' ? 'Accéder au back-office' : user.primaryRole === 'journalist' ? 'Ouvrir le tableau de bord journaliste' : 'Explorer les articles';

  return (
    <Container className="py-16">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Espace privé"
          title={`Bonjour ${user.fullName ?? user.email}`}
          description="Retrouvez ici un aperçu rapide de votre profil et un accès direct à vos outils."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-white/80 backdrop-blur dark:bg-slate-900/80">
              <CardTitle>{benefit.title}</CardTitle>
              <CardDescription>{benefit.description}</CardDescription>
            </Card>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-slate-50 p-8 shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Prochaine étape</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Continuez votre navigation ou accédez à vos outils dédiés.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={nextStepLink}>{nextStepLabel}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/newsletter">Gérer mes newsletters</Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
