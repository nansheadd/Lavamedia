"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAccessToken } from '@/lib/auth-service';

type ApiContent = {
  id: number;
};

const DEFAULT_BODY =
  'Commencez votre article ici. Vous pourrez enrichir le texte, ajouter des médias et structurer vos parties dans le studio.';

function normalizeSlug(source: string) {
  const base = source
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base;
}

export function CreateArticleForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'article' | 'reportage' | 'podcast'>('article');
  const [body, setBody] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uniqueSuffix = useId().replace(/[^a-z0-9]/gi, '').slice(-4);
  const slugPreview = useMemo(() => {
    const normalized = normalizeSlug(title || 'nouvel-article');
    const suffix = uniqueSuffix || 'auto';
    return normalized ? `${normalized}-${suffix}` : `article-${suffix}`;
  }, [title, uniqueSuffix]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Indiquez un titre pour votre article.');
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setError('Vous devez être connecté pour créer un article.');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          title: title.trim(),
          slug: slugPreview,
          body: body.trim() || DEFAULT_BODY,
          status: 'draft',
          workflow_state: 'draft',
          category_ids: [],
          media_links: []
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          (payload && typeof payload === 'object' && typeof payload.detail === 'string'
            ? payload.detail
            : response.statusText) || 'Impossible de créer l’article.';
        throw new Error(message);
      }

      const data = (await response.json()) as ApiContent;
      router.push(`/journalist/editeur?contentId=${data.id}`);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Titre de l’article
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ex. : Comment réinventer la couverture locale ?"
              required
            />
          </label>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Slug provisoire : {slugPreview}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Format
            <select
              value={type}
              onChange={(event) => setType(event.target.value as typeof type)}
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="article">Article</option>
              <option value="reportage">Reportage</option>
              <option value="podcast">Podcast</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Résumé (optionnel)
            <input
              type="text"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Un aperçu en 2 phrases. Le contenu détaillé sera rédigé dans l’éditeur."
            />
          </label>
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={creating}>
            {creating ? 'Création en cours…' : 'Créer et ouvrir dans l’éditeur'}
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            L’article sera enregistré en brouillon et visible uniquement depuis votre espace.
          </p>
        </div>
      </form>
    </div>
  );
}
