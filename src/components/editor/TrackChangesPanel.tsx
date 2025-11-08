'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FC } from 'react';

import type { EditorChangeRecord } from './types';

interface TrackChangesPanelProps {
  changes: EditorChangeRecord[];
  enabled: boolean;
  onToggle: () => void;
  onResolve: (id: string, resolution: 'applied' | 'discarded') => void;
}

const resolutionLabels: Record<EditorChangeRecord['resolution'], string> = {
  pending: 'En attente',
  applied: 'Appliquée',
  discarded: 'Rejetée'
};

export const TrackChangesPanel: FC<TrackChangesPanelProps> = ({ changes, enabled, onToggle, onResolve }) => {
  return (
    <aside className="flex h-full flex-col gap-6 border-l border-editor-subtle bg-editor-background/80 px-6 py-8">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Suivi des modifications
          </h2>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
          >
            {enabled ? 'Désactiver' : 'Activer'}
          </button>
        </div>
        <p className="text-sm text-slate-500">
          {enabled
            ? 'Chaque action est historisée. Validez ou rejetez les propositions.'
            : 'Réactivez le suivi pour capturer les prochaines modifications.'}
        </p>
      </header>
      <div className="editor-timeline space-y-6 overflow-y-auto">
        {changes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Aucune modification enregistrée pour l’instant.
          </p>
        ) : (
          changes.map((change) => (
            <article key={change.id} className="editor-timeline-item">
              <div className="editor-change">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                  <span>{resolutionLabels[change.resolution]}</span>
                  <span>
                    {formatDistanceToNow(new Date(change.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <p className="font-semibold text-slate-700">{change.summary}</p>
                {Object.keys(change.payload ?? {}).length > 0 && (
                  <pre className="whitespace-pre-wrap rounded-2xl bg-slate-900/90 px-4 py-3 text-xs text-slate-200 shadow-inner">
                    {JSON.stringify(change.payload, null, 2)}
                  </pre>
                )}
                {change.resolution === 'pending' && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => onResolve(change.id, 'applied')}
                      className="rounded-full bg-editor-success/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-editor-success"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => onResolve(change.id, 'discarded')}
                      className="rounded-full border border-editor-danger/40 bg-editor-danger/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-editor-danger transition hover:border-editor-danger/80 hover:bg-editor-danger/20"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
};
