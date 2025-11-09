'use client';

import type { EditorChangeRecord } from '../types';

interface WorkflowPanelProps {
  changes: EditorChangeRecord[];
}

export const WorkflowPanel = ({ changes }: WorkflowPanelProps) => {
  const pending = changes.filter((change) => change.resolution === 'pending');
  const applied = changes.filter((change) => change.resolution === 'applied');
  const discarded = changes.filter((change) => change.resolution === 'discarded');

  return (
    <section className="editor-section space-y-4" aria-label="Workflow de validation">
      <header className="space-y-2">
        <p className="editor-label">Workflow</p>
        <p className="text-sm text-slate-500">
          Visualisez l’état des propositions et partagez le suivi avec le comité éditorial.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <p className="text-xs font-semibold uppercase tracking-wide">En cours</p>
          <p className="text-2xl font-semibold">{pending.length}</p>
          <p className="text-xs text-amber-600/80">En attente de validation</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <p className="text-xs font-semibold uppercase tracking-wide">Validées</p>
          <p className="text-2xl font-semibold">{applied.length}</p>
          <p className="text-xs text-emerald-600/80">Déployées dans la version de référence</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="text-xs font-semibold uppercase tracking-wide">Refusées</p>
          <p className="text-2xl font-semibold">{discarded.length}</p>
          <p className="text-xs text-rose-600/80">À retravailler</p>
        </div>
      </div>
      {changes.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dernières propositions
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            {changes.slice(0, 5).map((change) => (
              <li
                key={change.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <p className="font-medium text-slate-900">{change.summary}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(change.createdAt).toLocaleString('fr-FR')} — {change.author ?? 'Collaborateur·ice'}
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Statut :{' '}
                  <span className="font-semibold uppercase tracking-wide">
                    {change.resolution === 'applied'
                      ? 'Validée'
                      : change.resolution === 'discarded'
                        ? 'Refusée'
                        : 'En attente'}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
