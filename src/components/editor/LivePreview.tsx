'use client';

import Image from 'next/image';
import type { FC } from 'react';

import type { EditorState } from './types';

export interface LivePreviewProps {
  state: EditorState;
}

const paragraphize = (body: string): string[] =>
  body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export const LivePreview: FC<LivePreviewProps> = ({ state }) => {
  const paragraphs = paragraphize(state.body);
  return (
    <section aria-label="Aperçu en direct" className="editor-section space-y-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          Aperçu instantané
        </p>
        <h1 className="font-editorial text-4xl font-semibold text-slate-900 dark:text-slate-100">
          {state.title || 'Titre en attente'}
        </h1>
        {state.chapeau && (
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-200">{state.chapeau}</p>
        )}
      </header>
      {state.lead && (
        <figure className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
          <div className="relative h-72 w-full">
            <Image
              src={state.lead.imageUrl}
              alt={state.lead.caption || 'Illustration de l’article'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {(state.lead.caption || state.lead.credit) && (
            <figcaption className="flex items-center justify-between bg-slate-50 px-6 py-3 text-sm text-slate-600">
              <span>{state.lead.caption}</span>
              {state.lead.credit && <span className="font-medium">© {state.lead.credit}</span>}
            </figcaption>
          )}
        </figure>
      )}
      <article className="editor-preview space-y-6">
        {paragraphs.length === 0 ? (
          <p className="text-slate-500">Commencez à écrire pour afficher l&apos;aperçu.</p>
        ) : (
          paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        )}
      </article>
      {state.callouts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Encadrés
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {state.callouts.map((callout) => (
              <div key={callout.id} className="editor-callout" data-tone={callout.tone}>
                <p className="font-semibold text-slate-900">{callout.title}</p>
                <p className="text-slate-700">{callout.body || 'Contenu à compléter.'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {state.footnotes.length > 0 && (
        <aside className="editor-footnotes">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes de bas de page
          </p>
          <ol className="space-y-2">
            {state.footnotes.map((note) => (
              <li key={note.id}>
                <span className="font-semibold text-primary-700">[{note.marker}]</span>{' '}
                <span>{note.content}</span>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </section>
  );
};
