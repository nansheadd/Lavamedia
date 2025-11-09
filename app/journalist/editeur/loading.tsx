'use client';

import { SectionHeading } from '@/components/ui/section-heading';

export default function JournalistEditorLoading() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Studio en cours de chargement"
        title="Initialisation de l'éditeur"
        description="Veuillez patienter quelques instants."
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        Préparation du studio éditorial...
      </div>
    </div>
  );
}
