'use client';

import { Fragment, type FC } from 'react';

import { EditorFootnote } from '../types';

type FootnoteHandlers = {
  onAdd: (content: string) => void;
  onUpdate: (id: string, content: string) => void;
  onRemove: (id: string) => void;
};

export interface FootnoteModuleProps extends FootnoteHandlers {
  footnotes: EditorFootnote[];
}

export const FootnoteModule: FC<FootnoteModuleProps> = ({ footnotes, onAdd, onUpdate, onRemove }) => {
  return (
    <section className="editor-section space-y-6" aria-label="Notes de bas de page">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="editor-label">Notes</p>
          <p className="text-sm text-slate-500">
            Conservez vos sources et références pour la validation éditoriale.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAdd('Nouvelle note à compléter...')}
          className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
        >
          Ajouter une note
        </button>
      </header>
      <ol className="space-y-4">
        {footnotes.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            Aucune note de bas de page pour le moment.
          </li>
        )}
        {footnotes.map((note) => (
          <Fragment key={note.id}>
            <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                  {note.marker}
                </span>
                <textarea
                  value={note.content}
                  onChange={(event) => onUpdate(note.id, event.target.value)}
                  className="editor-textarea"
                />
                <button
                  type="button"
                  onClick={() => onRemove(note.id)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-danger-300 hover:text-danger-500"
                >
                  Supprimer
                </button>
              </div>
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  );
};
