'use client';

import type { FC } from 'react';

import type { EditorCallout, EditorCalloutTone } from '../types';

interface CalloutModuleProps {
  callouts: EditorCallout[];
  onAdd: (tone: EditorCalloutTone) => void;
  onUpdate: (id: string, data: Partial<EditorCallout>) => void;
  onRemove: (id: string) => void;
}

const toneLabels: Record<EditorCalloutTone, string> = {
  info: 'Analyse',
  warning: 'Attention',
  success: 'Résultat'
};

export const CalloutModule: FC<CalloutModuleProps> = ({ callouts, onAdd, onUpdate, onRemove }) => {
  return (
    <section className="editor-section space-y-6" aria-label="Encadrés éditoriaux">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="editor-label">Encadrés</p>
          <p className="text-sm text-slate-500">
            Distinguez des informations clés ou mettez en évidence un témoignage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['info', 'warning', 'success'] as EditorCalloutTone[]).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => onAdd(tone)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
            >
              {toneLabels[tone]}
            </button>
          ))}
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {callouts.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            Aucun encadré défini. Ajoutez-en pour rythmer la lecture.
          </p>
        )}
        {callouts.map((callout) => (
          <div key={callout.id} className="editor-callout" data-tone={callout.tone}>
            <div className="flex items-start justify-between gap-3">
              <input
                value={callout.title}
                onChange={(event) => onUpdate(callout.id, { title: event.target.value })}
                className="editor-input text-base font-semibold"
              />
              <button
                type="button"
                onClick={() => onRemove(callout.id)}
                className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-danger-300 hover:text-danger-500"
              >
                Retirer
              </button>
            </div>
            <textarea
              value={callout.body}
              onChange={(event) => onUpdate(callout.id, { body: event.target.value })}
              className="mt-3 h-32 w-full rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
