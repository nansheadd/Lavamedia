import { useEffect, useReducer } from 'react';

import type {
  ChangeResolution,
  EditorCallout,
  EditorCalloutTone,
  EditorChangeRecord,
  EditorFootnote,
  EditorLead,
  EditorState
} from './types';

export interface EditorActionBase {
  summary?: string;
  payload?: Record<string, unknown>;
}

type EditorAction =
  | ({ type: 'setTitle'; value: string } & EditorActionBase)
  | ({ type: 'setChapeau'; value: string } & EditorActionBase)
  | ({ type: 'setBody'; value: string } & EditorActionBase)
  | ({ type: 'addFootnote'; content: string } & EditorActionBase)
  | ({ type: 'updateFootnote'; id: string; content: string } & EditorActionBase)
  | ({ type: 'removeFootnote'; id: string } & EditorActionBase)
  | ({ type: 'addCallout'; tone: EditorCalloutTone } & EditorActionBase)
  | ({ type: 'updateCallout'; id: string; data: Partial<EditorCallout> } & EditorActionBase)
  | ({ type: 'removeCallout'; id: string } & EditorActionBase)
  | ({ type: 'setLead'; lead: EditorLead | null } & EditorActionBase)
  | ({ type: 'toggleTrackChanges'; enabled?: boolean } & EditorActionBase)
  | ({ type: 'resolveChange'; id: string; resolution: ChangeResolution } & EditorActionBase)
  | ({ type: 'registerChange'; change: EditorChangeRecord })
  | ({ type: 'hydrate'; state: Partial<EditorState> });

export const createInitialEditorState = (
  state?: Partial<EditorState>
): EditorState => ({
  title: state?.title ?? '',
  chapeau: state?.chapeau ?? '',
  body: state?.body ?? '',
  footnotes: state?.footnotes ?? [],
  callouts: state?.callouts ?? [],
  lead: state?.lead ?? null,
  trackChangesEnabled: state?.trackChangesEnabled ?? true,
  changes: state?.changes ?? []
});

const generateId = (): string =>
  `chg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const withTracking = (
  state: EditorState,
  next: EditorState,
  summary: string | undefined,
  payload: Record<string, unknown> | undefined
): EditorState => {
  if (!state.trackChangesEnabled || !summary) {
    return next;
  }
  const change: EditorChangeRecord = {
    id: generateId(),
    summary,
    payload: payload ?? {},
    createdAt: new Date().toISOString(),
    author: 'vous',
    resolution: 'pending'
  };
  return {
    ...next,
    changes: [change, ...next.changes]
  };
};

const updateFootnoteMarkers = (footnotes: EditorFootnote[]): EditorFootnote[] =>
  footnotes.map((note, index) => ({
    ...note,
    marker: `${index + 1}`
  }));

const editorReducerInternal = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        ...action.state,
        footnotes: updateFootnoteMarkers(action.state.footnotes ?? state.footnotes),
        callouts: action.state.callouts ?? state.callouts,
        lead: action.state.lead ?? state.lead,
        changes: action.state.changes ?? state.changes
      };
    case 'setTitle': {
      const next = { ...state, title: action.value };
      return withTracking(state, next, action.summary ?? 'Titre mis à jour', action.payload);
    }
    case 'setChapeau': {
      const next = { ...state, chapeau: action.value };
      return withTracking(state, next, action.summary ?? 'Chapeau mis à jour', action.payload);
    }
    case 'setBody': {
      const next = { ...state, body: action.value };
      return withTracking(state, next, action.summary ?? 'Contenu mis à jour', action.payload);
    }
    case 'addFootnote': {
      const footnote: EditorFootnote = {
        id: generateId(),
        marker: '0',
        content: action.content
      };
      const next = {
        ...state,
        footnotes: updateFootnoteMarkers([footnote, ...state.footnotes])
      };
      return withTracking(
        state,
        next,
        action.summary ?? 'Note de bas de page ajoutée',
        action.payload ?? { content: action.content }
      );
    }
    case 'updateFootnote': {
      const nextFootnotes = updateFootnoteMarkers(
        state.footnotes.map((note) =>
          note.id === action.id ? { ...note, content: action.content } : note
        )
      );
      const next = {
        ...state,
        footnotes: nextFootnotes
      };
      return withTracking(
        state,
        next,
        action.summary ?? 'Note de bas de page modifiée',
        action.payload ?? { id: action.id }
      );
    }
    case 'removeFootnote': {
      const nextFootnotes = updateFootnoteMarkers(
        state.footnotes.filter((note) => note.id !== action.id)
      );
      const next = {
        ...state,
        footnotes: nextFootnotes
      };
      return withTracking(
        state,
        next,
        action.summary ?? 'Note de bas de page supprimée',
        action.payload ?? { id: action.id }
      );
    }
    case 'addCallout': {
      const callout: EditorCallout = {
        id: generateId(),
        title: 'Nouveau focus',
        body: '',
        tone: action.tone
      };
      const next = {
        ...state,
        callouts: [callout, ...state.callouts]
      };
      return withTracking(
        state,
        next,
        action.summary ?? 'Encadré ajouté',
        action.payload ?? { tone: action.tone }
      );
    }
    case 'updateCallout': {
      const nextCallouts = state.callouts.map((callout) =>
        callout.id === action.id ? { ...callout, ...action.data } : callout
      );
      const next = {
        ...state,
        callouts: nextCallouts
      };
      return withTracking(
        state,
        next,
        action.summary ?? 'Encadré modifié',
        action.payload ?? { id: action.id }
      );
    }
    case 'removeCallout': {
      const next = {
        ...state,
        callouts: state.callouts.filter((callout) => callout.id !== action.id)
      };
      return withTracking(
        state,
        next,
        action.summary ?? 'Encadré supprimé',
        action.payload ?? { id: action.id }
      );
    }
    case 'setLead': {
      const next = { ...state, lead: action.lead };
      return withTracking(state, next, action.summary ?? 'Mise à jour du chapeau visuel', action.payload);
    }
    case 'toggleTrackChanges': {
      const enabled = action.enabled ?? !state.trackChangesEnabled;
      return { ...state, trackChangesEnabled: enabled };
    }
    case 'resolveChange': {
      const next = {
        ...state,
        changes: state.changes.map((change) =>
          change.id === action.id ? { ...change, resolution: action.resolution } : change
        )
      };
      return next;
    }
    case 'registerChange': {
      return {
        ...state,
        changes: [action.change, ...state.changes]
      };
    }
    default:
      return state;
  }
};

export const useEditorState = (
  initialState?: Partial<EditorState>,
  onChange?: (state: EditorState) => void
) => {
  const [state, dispatch] = useReducer(editorReducerInternal, initialState, createInitialEditorState);
  useEffect(() => {
    onChange?.(state);
  }, [state, onChange]);
  return { state, dispatch } as const;
};
