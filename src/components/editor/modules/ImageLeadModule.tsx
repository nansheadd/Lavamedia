'use client';

import type { ChangeEvent, FC } from 'react';

import type { EditorLead } from '../types';

interface ImageLeadModuleProps {
  lead: EditorLead | null;
  onChange: (lead: EditorLead | null) => void;
}

const emptyLead: EditorLead = {
  imageUrl: '',
  caption: '',
  credit: ''
};

export const ImageLeadModule: FC<ImageLeadModuleProps> = ({ lead, onChange }) => {
  const currentLead = lead ?? emptyLead;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    onChange({ ...currentLead, [name]: value });
  };

  return (
    <section className="editor-section space-y-6" aria-label="Chapeau visuel">
      <header className="space-y-2">
        <p className="editor-label">Image &amp; chapeau</p>
        <p className="text-sm text-slate-500">
          Harmonisez visuel et chapô pour renforcer l'entrée en matière de l'article.
        </p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            URL de l'image
            <input
              name="imageUrl"
              value={currentLead.imageUrl}
              onChange={handleChange}
              placeholder="https://cdn.lavamedia.example/lead.jpg"
              className="editor-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            Légende
            <textarea
              name="caption"
              value={currentLead.caption}
              onChange={handleChange}
              className="editor-textarea"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            Crédit photo
            <input
              name="credit"
              value={currentLead.credit}
              onChange={handleChange}
              placeholder="Nom du photographe / agence"
              className="editor-input"
            />
          </label>
        </div>
        <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          <p className="font-semibold text-slate-600">Prévisualisation</p>
          {currentLead.imageUrl ? (
            <img
              src={currentLead.imageUrl}
              alt={currentLead.caption || 'Illustration'}
              className="mt-4 h-48 w-full rounded-2xl object-cover"
            />
          ) : (
            <p className="mt-4 text-xs">
              Ajoutez une URL d'image valide pour afficher un aperçu. Les images sont chargées côté client.
            </p>
          )}
          {(currentLead.caption || currentLead.credit) && (
            <p className="mt-4 text-xs text-slate-500">
              {currentLead.caption} {currentLead.credit && ` — © ${currentLead.credit}`}
            </p>
          )}
          {lead && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-danger-300 hover:text-danger-500"
            >
              Retirer le visuel
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
