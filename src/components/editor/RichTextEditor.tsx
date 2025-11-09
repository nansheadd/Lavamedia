'use client';

import { useCallback, useEffect, useMemo, useState, type FC, type FormEvent } from 'react';

import { createChangeRequest, decideChangeRequest, exportDocx, exportPdf, fetchChangeRequests } from './api';
import { LivePreview } from './LivePreview';
import { TrackChangesPanel } from './TrackChangesPanel';
import { useEditorState } from './state';
import type {
  ChangeRequestDTO,
  EditorState,
  EditorChangeRecord,
  EditorCalloutTone,
  EditorCallout,
  EditorLead,
  EditorBlock
} from './types';
import { FootnoteModule } from './modules/FootnoteModule';
import { CalloutModule } from './modules/CalloutModule';
import { ImageLeadModule } from './modules/ImageLeadModule';
import { BlockComposer } from './modules/BlockComposer';
import { SpellcheckPanel } from './modules/SpellcheckPanel';
import { WorkflowPanel } from './modules/WorkflowPanel';

interface RichTextEditorProps {
  contentId: number;
  baseVersionId: number;
  initialState?: Partial<EditorState>;
  onStateChange?: (state: EditorState) => void;
}

type FeedbackState = { type: 'success' | 'error' | 'info'; message: string } | null;

const toChangeRecord = (change: ChangeRequestDTO): EditorChangeRecord => ({
  id: `srv_${change.id}`,
  summary: change.summary,
  payload: change.proposed_changes ?? {},
  createdAt: change.created_at,
  author: change.proposed_by_id ? `Rédacteur·ice #${change.proposed_by_id}` : 'Collaboration',
  resolution:
    change.status === 'approved'
      ? 'applied'
      : change.status === 'rejected'
        ? 'discarded'
        : 'pending'
});

export const RichTextEditor: FC<RichTextEditorProps> = ({
  contentId,
  baseVersionId,
  initialState,
  onStateChange
}) => {
  const { state, dispatch } = useEditorState(initialState, onStateChange);
  const [changeRequests, setChangeRequests] = useState<ChangeRequestDTO[]>([]);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [changeComment, setChangeComment] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  const loadChangeRequests = useCallback(async () => {
    if (!contentId) {
      return;
    }
    setLoadingChanges(true);
    try {
      const data = await fetchChangeRequests(contentId);
      setChangeRequests(data);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setLoadingChanges(false);
    }
  }, [contentId]);

  useEffect(() => {
    void loadChangeRequests();
  }, [loadChangeRequests]);

  useEffect(() => {
    if (initialState) {
      dispatch({ type: 'hydrate', state: initialState });
    }
  }, [dispatch, initialState]);

  const serverChangeRecords = useMemo(
    () => changeRequests.map(toChangeRecord),
    [changeRequests]
  );

  const combinedChanges = useMemo<EditorChangeRecord[]>(
    () => [...serverChangeRecords, ...state.changes],
    [serverChangeRecords, state.changes]
  );

  const spellcheckSource = useMemo(() => {
    const blockText = state.blocks
      .map((block) => {
        if (block.type === 'text') {
          return block.content;
        }
        if (block.type === 'list') {
          return block.items.join('\n');
        }
        if (block.type === 'image') {
          return `${block.caption ?? ''} ${block.credit ?? ''}`.trim();
        }
        if (block.type === 'gallery') {
          return block.images.map((image) => `${image.caption ?? ''} ${image.credit ?? ''}`.trim()).join('\n');
        }
        if (block.type === 'video') {
          return `${block.title ?? ''}`;
        }
        if (block.type === 'audio') {
          return `${block.title ?? ''}\n${block.transcript ?? ''}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
    const calloutText = state.callouts
      .map((callout) => `${callout.title}\n${callout.body}`)
      .join('\n');
    const footnoteText = state.footnotes.map((note) => note.content).join('\n');
    return [state.title, state.chapeau, blockText, calloutText, footnoteText]
      .filter(Boolean)
      .join('\n\n');
  }, [state]);

  const handleFootnoteAdd = (content: string) =>
    dispatch({ type: 'addFootnote', content, summary: 'Note ajoutée', payload: { content } });
  const handleFootnoteUpdate = (id: string, content: string) =>
    dispatch({ type: 'updateFootnote', id, content, summary: 'Note modifiée', payload: { id } });
  const handleFootnoteRemove = (id: string) =>
    dispatch({ type: 'removeFootnote', id, summary: 'Note supprimée', payload: { id } });
  const handleBlockInsert = useCallback(
    (block: EditorBlock, position?: number) =>
      dispatch({
        type: 'addBlock',
        block,
        position,
        summary: 'Bloc ajouté',
        payload: { type: block.type, position }
      }),
    [dispatch]
  );
  const handleBlockUpdate = useCallback(
    (id: string, patch: Partial<EditorBlock>) =>
      dispatch({
        type: 'updateBlock',
        id,
        patch,
        summary: 'Bloc mis à jour',
        payload: { id, keys: Object.keys(patch ?? {}) }
      }),
    [dispatch]
  );
  const handleBlockRemove = useCallback(
    (id: string) =>
      dispatch({ type: 'removeBlock', id, summary: 'Bloc supprimé', payload: { id } }),
    [dispatch]
  );
  const handleBlockMove = useCallback(
    (id: string, direction: 'up' | 'down' | 'top' | 'bottom') =>
      dispatch({ type: 'moveBlock', id, direction, summary: 'Bloc réorganisé', payload: { id, direction } }),
    [dispatch]
  );
  const handleBlockDuplicate = useCallback(
    (id: string) =>
      dispatch({ type: 'duplicateBlock', id, summary: 'Bloc dupliqué', payload: { id } }),
    [dispatch]
  );
  const handleCalloutAdd = (tone: EditorCalloutTone) =>
    dispatch({ type: 'addCallout', tone, summary: 'Encadré ajouté', payload: { tone } });
  const handleCalloutUpdate = (id: string, data: Partial<EditorCallout>) =>
    dispatch({ type: 'updateCallout', id, data, summary: 'Encadré ajusté', payload: { id } });
  const handleCalloutRemove = (id: string) =>
    dispatch({ type: 'removeCallout', id, summary: 'Encadré retiré', payload: { id } });
  const handleLeadChange = (lead: EditorLead | null) =>
    dispatch({ type: 'setLead', lead, summary: 'Chapeau visuel mis à jour', payload: { hasLead: Boolean(lead) } });

  const handleChangeRequestSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!changeSummary.trim()) {
        setFeedback({ type: 'error', message: 'Merci de préciser un résumé pour la proposition.' });
        return;
      }
      setIsSubmitting(true);
      setFeedback({ type: 'info', message: 'Soumission de la proposition en cours…' });
      try {
        const proposedChanges = {
          title: state.title,
          chapeau: state.chapeau,
          body: state.body,
          footnotes: state.footnotes,
          callouts: state.callouts,
          lead: state.lead,
          diff: {
            chapeau: state.chapeau,
            footnotes: state.footnotes,
            callouts: state.callouts,
            lead: state.lead
          }
        };
        await createChangeRequest(contentId, {
          base_version_id: baseVersionId,
          summary: changeSummary,
          proposed_changes: proposedChanges,
          comment: changeComment || undefined
        });
        setFeedback({ type: 'success', message: 'Proposition envoyée. Un·e éditeur·ice va la valider.' });
        setChangeSummary('');
        setChangeComment('');
        await loadChangeRequests();
      } catch (error) {
        setFeedback({ type: 'error', message: (error as Error).message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [baseVersionId, changeComment, changeSummary, contentId, loadChangeRequests, state]
  );

  const handleExportDocx = useCallback(async () => {
    setIsExportingDocx(true);
    setFeedback({ type: 'info', message: 'Génération du fichier Word…' });
    try {
      const blob = await exportDocx(contentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = state.title ? state.title.replace(/\s+/g, '-') : `article-${contentId}`;
      link.download = `${baseName}.docx`;
      link.click();
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Export Word généré avec succès.' });
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setIsExportingDocx(false);
    }
  }, [contentId, state.title]);

  const handleExportPdf = useCallback(async () => {
    setIsExportingPdf(true);
    setFeedback({ type: 'info', message: 'Génération du PDF…' });
    try {
      const blob = await exportPdf(contentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const baseName = state.title ? state.title.replace(/\s+/g, '-') : `article-${contentId}`;
      link.href = url;
      link.download = `${baseName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Export PDF prêt à partager.' });
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setIsExportingPdf(false);
    }
  }, [contentId, state.title]);

  const handleResolveChange = useCallback(
    async (id: string, resolution: 'applied' | 'discarded') => {
      if (id.startsWith('srv_')) {
        const changeId = Number(id.replace('srv_', ''));
        const status = resolution === 'applied' ? 'approved' : 'rejected';
        try {
          await decideChangeRequest(contentId, changeId, {
            status,
            notes:
              resolution === 'applied'
                ? 'Validation depuis le studio éditorial'
                : 'Rejet depuis le studio éditorial'
          });
          setFeedback({
            type: 'success',
            message: resolution === 'applied' ? 'Modification approuvée.' : 'Modification rejetée.'
          });
          await loadChangeRequests();
        } catch (error) {
          setFeedback({ type: 'error', message: (error as Error).message });
        }
        return;
      }
      dispatch({ type: 'resolveChange', id, resolution });
    },
    [contentId, dispatch, loadChangeRequests]
  );

  return (
    <div className="editor-shell">
      <div className="editor-toolbar">
        <div>
          <h1 className="text-base font-semibold uppercase tracking-wide text-slate-600">
            Studio éditorial collaboratif
          </h1>
          <p className="text-xs text-slate-500">Contenu #{contentId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: 'toggleTrackChanges' })}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
          >
            {state.trackChangesEnabled ? 'Suivi actif' : 'Activer le suivi'}
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExportingDocx ? 'Export…' : 'Exporter (.docx)'}
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExportingPdf ? 'PDF…' : 'Exporter (.pdf)'}
            </button>
          </div>
        </div>
      </div>
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-4 border-b px-6 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border-editor-danger/50 bg-editor-danger/10 text-editor-danger'
              : feedback.type === 'success'
                ? 'border-editor-success/50 bg-editor-success/10 text-editor-success'
                : 'border-primary-200 bg-primary-50 text-primary-700'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            className="text-xs uppercase tracking-wide text-slate-500"
            onClick={() => setFeedback(null)}
          >
            Fermer
          </button>
        </div>
      )}
      <div className="flex flex-col gap-0 lg:grid lg:editor-grid">
        <div className="space-y-8 divide-y divide-slate-100">
          <section className="editor-section space-y-5" aria-label="Composition de l’article">
            <div className="grid gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Titre
                <input
                  value={state.title}
                  onChange={(event) =>
                    dispatch({
                      type: 'setTitle',
                      value: event.target.value,
                      summary: 'Titre mis à jour',
                      payload: { value: event.target.value }
                    })
                  }
                  className="editor-input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Chapô
                <textarea
                  value={state.chapeau}
                  onChange={(event) =>
                    dispatch({
                      type: 'setChapeau',
                      value: event.target.value,
                      summary: 'Chapô ajusté',
                      payload: { value: event.target.value }
                    })
                  }
                  className="editor-textarea"
                />
              </label>
            </div>
          </section>
          <BlockComposer
            blocks={state.blocks}
            footnotes={state.footnotes}
            onInsert={handleBlockInsert}
            onUpdate={handleBlockUpdate}
            onRemove={handleBlockRemove}
            onMove={handleBlockMove}
            onDuplicate={handleBlockDuplicate}
          />
          <ImageLeadModule lead={state.lead} onChange={handleLeadChange} />
          <CalloutModule
            callouts={state.callouts}
            onAdd={handleCalloutAdd}
            onUpdate={handleCalloutUpdate}
            onRemove={handleCalloutRemove}
          />
          <FootnoteModule
            footnotes={state.footnotes}
            onAdd={handleFootnoteAdd}
            onUpdate={handleFootnoteUpdate}
            onRemove={handleFootnoteRemove}
          />
          <SpellcheckPanel text={spellcheckSource} />
          <WorkflowPanel changes={combinedChanges} />
          <section className="editor-section" aria-label="Soumission de proposition">
            <form className="space-y-5" onSubmit={handleChangeRequestSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Résumé de la proposition
                  <input
                    value={changeSummary}
                    onChange={(event) => setChangeSummary(event.target.value)}
                    placeholder="Ex : enrichissement des notes et chapô"
                    className="editor-input"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Commentaire
                  <input
                    value={changeComment}
                    onChange={(event) => setChangeComment(event.target.value)}
                    placeholder="Contexte pour l’équipe éditoriale"
                    className="editor-input"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-editor-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Soumission…' : 'Soumettre au comité'}
              </button>
            </form>
          </section>
          <div className="flex justify-end gap-2 pb-4">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                previewViewport === 'desktop'
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-200 text-slate-600'
              }`}
              onClick={() => setPreviewViewport('desktop')}
            >
              Desktop
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                previewViewport === 'mobile'
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-200 text-slate-600'
              }`}
              onClick={() => setPreviewViewport('mobile')}
            >
              Mobile
            </button>
          </div>
          <LivePreview state={state} viewport={previewViewport} />
        </div>
        <TrackChangesPanel
          changes={combinedChanges}
          enabled={state.trackChangesEnabled}
          onToggle={() => dispatch({ type: 'toggleTrackChanges' })}
          onResolve={handleResolveChange}
        />
      </div>
      {loadingChanges && (
        <div className="border-t border-editor-subtle bg-editor-background px-6 py-3 text-xs text-slate-500">
          Actualisation des propositions en cours…
        </div>
      )}
    </div>
  );
};
