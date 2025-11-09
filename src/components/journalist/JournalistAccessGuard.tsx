"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const ALLOWED_ROLES = new Set(["author", "editor", "admin"]);

type JournalistAccessGuardProps = {
  children: ReactNode;
};

export function JournalistAccessGuard({ children }: JournalistAccessGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !ALLOWED_ROLES.has(user.primaryRole)) {
      router.replace("/espace");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        Vérification des droits en cours…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <p>Vous devez être connecté·e pour accéder à cette section.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">Créer un compte</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!ALLOWED_ROLES.has(user.primaryRole)) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
        <p>Votre rôle ne vous autorise pas à consulter cette page.</p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/espace">Retour à mon espace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
