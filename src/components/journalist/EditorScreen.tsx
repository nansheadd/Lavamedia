'use client';

import { useEffect, useMemo, useState } from 'react';
import { RichTextEditor, type EditorState, type EditorCalloutTone } from '@/components/editor';
import { fetchFromApi } from '@/lib/auth-service';

type ContentVersion = {
  id: number;
  version_number: number;
  body: string;
  diff?: Record<string, unknown> | null;
};

type ContentItem = {
  id: number;
  title: string;
  slug: string;
  updated_at?: string;
  versions: ContentVersion[];
};

type PreparedState = {
  baseVersionId: number | null;
  state: Partial<EditorState>;
};

const TONES: EditorCalloutTone[] = ['info', 'warning', 'success'];

function prepareEditorState(content: ContentItem): PreparedState {
  const versions = [...(content.versions ?? [])];
  versions.sort((a, b) => a.version_number - b.version_number);
  const latest = versions.at(-1);

  const diff = (latest?.diff ?? {}) as Record<string, unknown>;
  const diffFootnotes = diff['footnotes'];
  const rawFootnotes = Array.isArray(diffFootnotes)
    ? (diffFootnotes as unknown[])
    : [];
  const footnotes = rawFootnotes.map((note, index) => {
    if (note && typeof note === 'object') {
      const record = note as Record<string, unknown>;
      const value = record['content'];
      return {
        id: `foot_${content.id}_${index}`,
        marker: String(index + 1),
        content: typeof value === 'string' ? value : String(value ?? '')
      };
    }
    return {
      id: `foot_${content.id}_${index}`,
      marker: String(index + 1),
      content: typeof note === 'string' ? note : ''
    };
  });

  const diffCallouts = diff['callouts'];
  const rawCallouts = Array.isArray(diffCallouts)
    ? (diffCallouts as unknown[])
    : [];
  const callouts = rawCallouts.map((callout, index) => {
    const record = callout && typeof callout === 'object' ? (callout as Record<string, unknown>) : {};
    const tone = record['tone'];
    const normalizedTone =
      typeof tone === 'string' && TONES.includes(tone as EditorCalloutTone)
        ? (tone as EditorCalloutTone)
        : 'info';
    return {
      id: `callout_${content.id}_${index}`,
      title: typeof record['title'] === 'string' ? (record['title'] as string) : 'Encadré',
      body: typeof record['body'] === 'string' ? (record['body'] as string) : '',
      tone: normalizedTone
    };
  });

  const lead = diff['lead'];
  const leadRecord = lead && typeof lead === 'object' ? (lead as Record<string, unknown>) : null;
  const leadValue =
    leadRecord
      ? {
          imageUrl: typeof leadRecord['imageUrl'] === 'string' ? (leadRecord['imageUrl'] as string) : '',
          caption: typeof leadRecord['caption'] === 'string' ? (leadRecord['caption'] as string) : '',
          credit: typeof leadRecord['credit'] === 'string' ? (leadRecord['credit'] as string) : undefined
        }
      : null;

  const chapeau = diff['chapeau'];

  return {
    baseVersionId: latest?.id ?? null,
    state: {
      title: content.title ?? '',
      chapeau: typeof chapeau === 'string' ? chapeau : '',
      body: latest?.body ?? '',
      footnotes,
      callouts,
      lead: leadValue,
      trackChangesEnabled: true,
      changes: []
    }
  };
}

export function EditorScreen() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastState, setLastState] = useState<EditorState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchFromApi('/api/content');
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Impossible de récupérer les contenus.');
        }
        const data = (await response.json()) as ContentItem[];
        if (cancelled) {
          return;
        }
        setContents(data);
        if (data.length > 0) {
          setSelectedContentId(data[0].id);
        }
        setError(null);
      } catch (cause) {
        if (!cancelled) {
          setError((cause as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedContent = useMemo(
    () => contents.find((content) => content.id === selectedContentId) ?? null,
    [contents, selectedContentId]
  );

  const prepared = useMemo(() => (selectedContent ? prepareEditorState(selectedContent) : null), [selectedContent]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        Chargement du studio éditorial…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Assurez-vous que l’API FastAPI est démarrée sur <code className="font-mono">http://localhost:8000</code> et que votre
          compte dispose des droits journaliste ou éditeur.
        </p>
      </div>
    );
  }

  if (!prepared || prepared.baseVersionId === null || !selectedContent) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        Aucun contenu disponible pour l’instant. Créez un article dans le back-office pour activer le studio éditorial.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Sélection du contenu
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedContent.title}</h2>
            {selectedContent.updated_at ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dernière mise à jour : {new Date(selectedContent.updated_at).toLocaleString('fr-FR')}
              </p>
            ) : null}
            {lastState ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Suivi actif — {lastState.changes.length} modification(s) locale(s) en attente
              </p>
            ) : null}
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 md:w-72">
            Choisir un autre article
            <select
              value={selectedContentId ?? ''}
              onChange={(event) => {
                const nextId = Number(event.target.value);
                setSelectedContentId(Number.isNaN(nextId) ? null : nextId);
              }}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {contents.map((content) => (
                <option key={content.id} value={content.id}>
                  {content.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <RichTextEditor
        contentId={selectedContent.id}
        baseVersionId={prepared.baseVersionId}
        initialState={prepared.state}
        onStateChange={(state) => setLastState(state)}
      />
    </div>
  );
}
