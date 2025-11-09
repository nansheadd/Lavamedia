import { useEffect, useReducer } from 'react';

import type {
  ChangeResolution,
  EditorAudioBlock,
  EditorBlock,
  EditorCallout,
  EditorCalloutTone,
  EditorChangeRecord,
  EditorFootnote,
  EditorGalleryBlock,
  EditorImageBlock,
  EditorLead,
  EditorListBlock,
  EditorState,
  EditorTextBlock,
  EditorVideoBlock
} from './types';

export interface EditorActionBase {
  summary?: string;
  payload?: Record<string, unknown>;
}

type EditorAction =
  | ({ type: 'setTitle'; value: string } & EditorActionBase)
  | ({ type: 'setChapeau'; value: string } & EditorActionBase)
  | ({ type: 'setBody'; value: string } & EditorActionBase)
  | ({ type: 'replaceBlocks'; blocks: EditorBlock[] } & EditorActionBase)
  | ({ type: 'addBlock'; block: EditorBlock; position?: number } & EditorActionBase)
  | ({ type: 'updateBlock'; id: string; patch: Partial<EditorBlock> } & EditorActionBase)
  | ({ type: 'removeBlock'; id: string } & EditorActionBase)
  | ({ type: 'moveBlock'; id: string; direction: 'up' | 'down' | 'top' | 'bottom' | number } & EditorActionBase)
  | ({ type: 'duplicateBlock'; id: string } & EditorActionBase)
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

const generateId = (): string =>
  `chg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const cloneBlock = (block: EditorBlock): EditorBlock => {
  switch (block.type) {
    case 'text':
      return { ...block } satisfies EditorTextBlock;
    case 'list':
      return { ...block, items: [...block.items] } satisfies EditorListBlock;
    case 'image':
      return { ...block } satisfies EditorImageBlock;
    case 'gallery':
      return {
        ...block,
        images: block.images.map((image) => ({ ...image, id: generateId() }))
      } satisfies EditorGalleryBlock;
    case 'video':
      return { ...block } satisfies EditorVideoBlock;
    case 'audio':
      return { ...block } satisfies EditorAudioBlock;
    default:
      return block;
  }
};

const deriveBlocksFromBody = (body: string): EditorBlock[] => {
  if (!body.trim()) {
    return [
      {
        id: generateId(),
        type: 'text',
        style: 'paragraph',
        content: ''
      } satisfies EditorTextBlock
    ];
  }

  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph, index) => {
    if (/^#\s+/.test(paragraph)) {
      return {
        id: `blk_${index}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'text',
        style: 'heading1',
        content: paragraph.replace(/^#\s+/, '')
      } satisfies EditorTextBlock;
    }
    if (/^##\s+/.test(paragraph)) {
      return {
        id: `blk_${index}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'text',
        style: 'heading2',
        content: paragraph.replace(/^##\s+/, '')
      } satisfies EditorTextBlock;
    }
    if (/^>\s+/.test(paragraph)) {
      return {
        id: `blk_${index}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'text',
        style: 'blockquote',
        content: paragraph.replace(/^>\s+/, '')
      } satisfies EditorTextBlock;
    }
    const lines = paragraph.split(/\n/);
    if (lines.every((line) => /^-\s+/.test(line))) {
      return {
        id: `blk_${index}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'list',
        style: 'unordered',
        items: lines.map((line) => line.replace(/^-\s+/, '').trim()).filter(Boolean)
      } satisfies EditorListBlock;
    }
    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      return {
        id: `blk_${index}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'list',
        style: 'ordered',
        items: lines.map((line) => line.replace(/^\d+\.\s+/, '').trim()).filter(Boolean)
      } satisfies EditorListBlock;
    }
    return {
      id: `blk_${index}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'text',
      style: index === 0 ? 'lead' : 'paragraph',
      content: paragraph
    } satisfies EditorTextBlock;
  });
};

const serializeBlocksToBody = (blocks: EditorBlock[]): string =>
  blocks
    .map((block) => {
      switch (block.type) {
        case 'text':
          if (block.style === 'heading1') {
            return `# ${block.content}`;
          }
          if (block.style === 'heading2') {
            return `## ${block.content}`;
          }
          if (block.style === 'blockquote') {
            return `> ${block.content}`;
          }
          return block.content;
        case 'list':
          return block.items
            .map((item, index) =>
              block.style === 'ordered' ? `${index + 1}. ${item}` : `- ${item}`
            )
            .join('\n');
        case 'image':
          return `![${block.caption ?? ''}](${block.url})`;
        case 'gallery':
          return block.images
            .map((image) => `![${image.caption ?? ''}](${image.url})`)
            .join('\n');
        case 'video':
          return `[video:${block.provider ?? 'file'}] ${block.url}`;
        case 'audio':
          return `[audio] ${block.url}`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

const ensureBlocks = (blocks: EditorBlock[]): EditorBlock[] =>
  blocks.length > 0
    ? blocks
    : [
        {
          id: generateId(),
          type: 'text',
          style: 'paragraph',
          content: ''
        } satisfies EditorTextBlock
      ];

const updateFootnoteMarkers = (footnotes: EditorFootnote[]): EditorFootnote[] =>
  footnotes.map((note, index) => ({
    ...note,
    marker: `${index + 1}`
  }));

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

const withBlocks = (state: EditorState, blocks: EditorBlock[]): EditorState => {
  const safeBlocks = ensureBlocks(blocks);
  return {
    ...state,
    blocks: safeBlocks,
    body: serializeBlocksToBody(safeBlocks)
  };
};

export const createInitialEditorState = (
  state?: Partial<EditorState>
): EditorState => {
  const initialBlocks = ensureBlocks(
    state?.blocks ?? deriveBlocksFromBody(state?.body ?? '')
  );
  return {
    title: state?.title ?? '',
    chapeau: state?.chapeau ?? '',
    body: state?.body ?? serializeBlocksToBody(initialBlocks),
    blocks: initialBlocks,
    footnotes: state?.footnotes ?? [],
    callouts: state?.callouts ?? [],
    lead: state?.lead ?? null,
    trackChangesEnabled: state?.trackChangesEnabled ?? true,
    changes: state?.changes ?? []
  };
};

const editorReducerInternal = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'hydrate': {
      const mergedBlocks = ensureBlocks(
        action.state.blocks ?? deriveBlocksFromBody(action.state.body ?? state.body)
      );
      const nextState: EditorState = {
        ...state,
        ...action.state,
        footnotes: updateFootnoteMarkers(action.state.footnotes ?? state.footnotes),
        callouts: action.state.callouts ?? state.callouts,
        lead: action.state.lead ?? state.lead,
        changes: action.state.changes ?? state.changes,
        blocks: mergedBlocks,
        body: action.state.body ?? serializeBlocksToBody(mergedBlocks)
      };
      return nextState;
    }
    case 'setTitle': {
      const next = { ...state, title: action.value };
      return withTracking(state, next, action.summary ?? 'Titre mis à jour', action.payload);
    }
    case 'setChapeau': {
      const next = { ...state, chapeau: action.value };
      return withTracking(state, next, action.summary ?? 'Chapeau mis à jour', action.payload);
    }
    case 'setBody': {
      const blocks = deriveBlocksFromBody(action.value);
      const next = withBlocks(state, blocks);
      return withTracking(state, next, action.summary ?? 'Contenu mis à jour', action.payload);
    }
    case 'replaceBlocks': {
      const next = withBlocks(state, action.blocks);
      return withTracking(state, next, action.summary ?? 'Blocs réorganisés', action.payload);
    }
    case 'addBlock': {
      const blocks = [...state.blocks];
      const position =
        typeof action.position === 'number'
          ? Math.min(Math.max(action.position, 0), blocks.length)
          : blocks.length;
      blocks.splice(position, 0, action.block);
      const next = withBlocks(state, blocks);
      return withTracking(state, next, action.summary ?? 'Bloc ajouté', action.payload);
    }
    case 'updateBlock': {
      const blocks = state.blocks.map((block) =>
        block.id === action.id ? ({ ...block, ...action.patch } as EditorBlock) : block
      );
      const next = withBlocks(state, blocks);
      return withTracking(state, next, action.summary ?? 'Bloc mis à jour', action.payload);
    }
    case 'removeBlock': {
      const blocks = state.blocks.filter((block) => block.id !== action.id);
      const next = withBlocks(state, blocks);
      return withTracking(state, next, action.summary ?? 'Bloc supprimé', action.payload);
    }
    case 'moveBlock': {
      const index = state.blocks.findIndex((block) => block.id === action.id);
      if (index === -1) {
        return state;
      }
      const blocks = [...state.blocks];
      const [block] = blocks.splice(index, 1);
      let targetIndex = index;
      if (typeof action.direction === 'number') {
        targetIndex = Math.min(Math.max(action.direction, 0), blocks.length);
      } else {
        switch (action.direction) {
          case 'up':
            targetIndex = Math.max(index - 1, 0);
            break;
          case 'down':
            targetIndex = Math.min(index + 1, blocks.length);
            break;
          case 'top':
            targetIndex = 0;
            break;
          case 'bottom':
            targetIndex = blocks.length;
            break;
          default:
            targetIndex = index;
            break;
        }
      }
      blocks.splice(targetIndex, 0, block);
      const next = withBlocks(state, blocks);
      return withTracking(state, next, action.summary ?? 'Bloc déplacé', action.payload);
    }
    case 'duplicateBlock': {
      const index = state.blocks.findIndex((block) => block.id === action.id);
      if (index === -1) {
        return state;
      }
      const duplicate = cloneBlock(state.blocks[index]);
      duplicate.id = generateId();
      const blocks = [...state.blocks];
      blocks.splice(index + 1, 0, duplicate);
      const next = withBlocks(state, blocks);
      return withTracking(state, next, action.summary ?? 'Bloc dupliqué', action.payload);
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
