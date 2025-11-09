"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RichTextEditor, type EditorState, type EditorCalloutTone } from '@/components/editor';
import { fetchFromApi } from '@/lib/auth-service';
import { MOCK_CONTENT_ITEMS, type MockContentItem, type MockContentVersion } from '@/data/editor-mock';
import { useLanguage, useTranslations } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';

type ContentVersion = MockContentVersion;
type ContentItem = MockContentItem;

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastState, setLastState] = useState<EditorState | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const t = useTranslations();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const isEditorialUser = user ? ['author', 'editor', 'admin'].includes(user.primaryRole) : false;

  const requestedContentId = useMemo(() => {
    const param = searchParams.get('contentId');
    if (!param) {
      return null;
    }
    const parsed = Number(param);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const pickInitialContentId = useCallback((items: ContentItem[]) => {
    if (items.length === 0) {
      return null;
    }
    if (requestedContentId && items.some((item) => item.id === requestedContentId)) {
      return requestedContentId;
    }
    return items[0].id;
  }, [requestedContentId]);

  const applyMockDataset = useCallback(() => {
    if (MOCK_CONTENT_ITEMS.length === 0) {
      return false;
    }
    setContents(MOCK_CONTENT_ITEMS);
    setSelectedContentId(pickInitialContentId(MOCK_CONTENT_ITEMS));
    setUsingMockData(true);
    setError(null);
    return true;
  }, [pickInitialContentId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !isEditorialUser) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchFromApi('/api/content');

        if (response.status === 404) {
          console.warn('API /content répond 404, bascule sur le mode démo.');
          applyMockDataset();
          return;
        }

        if (!response.ok) {
          let message = response.statusText || 'Impossible de récupérer les contenus.';
          try {
            const payload = await response.json();
            if (payload && typeof payload === 'object') {
              const detail = (payload as Record<string, unknown>).detail;
              if (typeof detail === 'string' && detail.trim().length > 0) {
                message = detail;
              }
            }
          } catch {
            // Ignore JSON parse errors and stick to the status text
          }
          throw new Error(message);
        }

        const data = (await response.json()) as ContentItem[];
        if (cancelled) {
          return;
        }
        if (data.length > 0) {
          setContents(data);
          setSelectedContentId(pickInitialContentId(data));
          setUsingMockData(false);
        } else {
          applyMockDataset();
        }
        setError(null);
      } catch (cause) {
        if (!cancelled) {
          console.warn('Échec du chargement des contenus live, utilisation d’un jeu de données local.', cause);
          const hasMock = applyMockDataset();
          if (!hasMock) {
            setError((cause as Error).message);
          }
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
  }, [applyMockDataset, pickInitialContentId, user, isEditorialUser]);

  const selectedContent = useMemo(
    () => contents.find((content) => content.id === selectedContentId) ?? null,
    [contents, selectedContentId]
  );

  const prepared = useMemo(
    () => (selectedContent ? prepareEditorState(selectedContent) : null),
    [selectedContent]
  );

  if (authLoading || loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        {t('editor.loading')}
      </div>
    );
  }

  if (!user || !isEditorialUser) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <p className="font-semibold text-primary-600">Accès restreint</p>
        <p className="mt-2 text-sm text-slate-500">
          Cette section est réservée aux auteurs, éditeurs et administrateurs. Connectez-vous avec un compte habilité.
        </p>
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
          <span dangerouslySetInnerHTML={{ __html: t('editor.connectionHint') }} />
        </p>
      </div>
    );
  }

  if (!prepared || prepared.baseVersionId === null || !selectedContent) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        {t('editor.empty')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {usingMockData ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
          <span dangerouslySetInnerHTML={{ __html: t('editor.demo') }} />
        </div>
      ) : null}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('editor.selectionEyebrow')}
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedContent.title}</h2>
            {selectedContent.updated_at ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('editor.lastUpdate', { date: new Date(selectedContent.updated_at).toLocaleString(language === 'nl' ? 'nl-NL' : 'fr-FR') })}
              </p>
            ) : null}
            {lastState ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {t('editor.tracking', { count: lastState.changes.length })}
              </p>
            ) : null}
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 md:w-72">
            {t('editor.chooseAnother')}
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
        language={language}
      />
    </div>
  );
}
