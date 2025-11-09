export type EditorCalloutTone = 'info' | 'warning' | 'success';

export interface EditorFootnote {
  id: string;
  marker: string;
  content: string;
}

export interface EditorCallout {
  id: string;
  title: string;
  body: string;
  tone: EditorCalloutTone;
}

export interface EditorLead {
  imageUrl: string;
  caption: string;
  credit?: string;
}

export type ChangeResolution = 'pending' | 'applied' | 'discarded';

export interface EditorChangeRecord {
  id: string;
  summary: string;
  payload: Record<string, unknown>;
  createdAt: string;
  author?: string;
  resolution: ChangeResolution;
}

export type EditorTextStyle =
  | 'paragraph'
  | 'lead'
  | 'heading1'
  | 'heading2'
  | 'blockquote';

export type EditorListStyle = 'unordered' | 'ordered';

export type EditorMediaFormat = 'inline' | 'wide' | 'full';

export type EditorMediaAlignment = 'left' | 'center' | 'right';

export interface EditorBlockBase {
  id: string;
  label?: string;
  footnoteIds?: string[];
}

export interface EditorTextBlock extends EditorBlockBase {
  type: 'text';
  style: EditorTextStyle;
  content: string;
}

export interface EditorListBlock extends EditorBlockBase {
  type: 'list';
  style: EditorListStyle;
  items: string[];
}

export interface EditorImageBlock extends EditorBlockBase {
  type: 'image';
  url: string;
  caption?: string;
  credit?: string;
  format: EditorMediaFormat;
  alignment: EditorMediaAlignment;
}

export interface EditorGalleryImage {
  id: string;
  url: string;
  caption?: string;
  credit?: string;
}

export interface EditorGalleryBlock extends EditorBlockBase {
  type: 'gallery';
  layout: 'grid' | 'carousel';
  images: EditorGalleryImage[];
}

export interface EditorVideoBlock extends EditorBlockBase {
  type: 'video';
  url: string;
  title?: string;
  poster?: string;
  provider?: 'youtube' | 'vimeo' | 'dailymotion' | 'file';
}

export interface EditorAudioBlock extends EditorBlockBase {
  type: 'audio';
  url: string;
  title?: string;
  transcript?: string;
}

export type EditorBlock =
  | EditorTextBlock
  | EditorListBlock
  | EditorImageBlock
  | EditorGalleryBlock
  | EditorVideoBlock
  | EditorAudioBlock;

export interface EditorState {
  title: string;
  chapeau: string;
  body: string;
  blocks: EditorBlock[];
  footnotes: EditorFootnote[];
  callouts: EditorCallout[];
  lead: EditorLead | null;
  trackChangesEnabled: boolean;
  changes: EditorChangeRecord[];
}

export interface ChangeRequestPayload {
  base_version_id: number;
  summary: string;
  proposed_changes: Record<string, unknown>;
  comment?: string | null;
}

export interface ChangeRequestDecisionPayload {
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
}

export interface ChangeRequestDTO {
  id: number;
  content_id: number;
  base_version_id: number;
  proposed_by_id: number | null;
  resolved_by_id: number | null;
  status: 'pending' | 'approved' | 'rejected';
  summary: string;
  comment: string | null;
  proposed_changes: Record<string, unknown>;
  decision_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}
