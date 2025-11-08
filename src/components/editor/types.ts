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

export interface EditorState {
  title: string;
  chapeau: string;
  body: string;
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
