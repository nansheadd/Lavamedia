import { getAccessToken } from '@/lib/auth-service';
import type {
  ChangeRequestDecisionPayload,
  ChangeRequestDTO,
  ChangeRequestPayload
} from './types';

const baseUrl = '/api/editorial';

function buildAuthHeaders(existing?: HeadersInit): Headers {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Votre session a expiré. Veuillez vous reconnecter pour continuer.');
  }

  const headers = new Headers(existing ?? undefined);
  headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    const fallback = message || 'Une erreur est survenue.';
    if (response.status === 401) {
      throw new Error('Authentification requise pour cette opération.');
    }
    if (response.status === 403) {
      throw new Error("Vous n'avez pas les droits suffisants pour cette action.");
    }
    throw new Error(fallback);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function fetchChangeRequests(contentId: number): Promise<ChangeRequestDTO[]> {
  const response = await fetch(`${baseUrl}/content/${contentId}/changes`, {
    headers: buildAuthHeaders()
  });
  return handleResponse<ChangeRequestDTO[]>(response);
}

export async function createChangeRequest(
  contentId: number,
  payload: ChangeRequestPayload
): Promise<ChangeRequestDTO> {
  const response = await fetch(`${baseUrl}/content/${contentId}/changes`, {
    method: 'POST',
    headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  return handleResponse<ChangeRequestDTO>(response);
}

export async function decideChangeRequest(
  contentId: number,
  changeId: number,
  payload: ChangeRequestDecisionPayload
): Promise<ChangeRequestDTO> {
  const response = await fetch(`${baseUrl}/content/${contentId}/changes/${changeId}/decision`, {
    method: 'POST',
    headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  return handleResponse<ChangeRequestDTO>(response);
}

export async function exportDocx(contentId: number): Promise<Blob> {
  const response = await fetch(`${baseUrl}/content/${contentId}/export/docx`, {
    method: 'POST',
    headers: buildAuthHeaders()
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Impossible d'exporter le document");
  }
  return await response.blob();
}

export async function exportPdf(contentId: number): Promise<Blob> {
  const response = await fetch(`${baseUrl}/content/${contentId}/export/pdf`, {
    method: 'POST',
    headers: buildAuthHeaders()
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Impossible d'exporter le PDF");
  }
  return await response.blob();
}

export type ImportDocxResponse = {
  title: string;
  chapeau: string;
  body: string;
};

export async function importDocxDraft(file: File): Promise<ImportDocxResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${baseUrl}/content/import/docx`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData
  });
  return handleResponse<ImportDocxResponse>(response);
}

export type TranslationResponse = {
  title: string;
  chapeau: string;
  body: string;
};

export async function requestTranslation(
  contentId: number,
  targetLanguage: 'fr' | 'nl'
): Promise<TranslationResponse> {
  const response = await fetch(`${baseUrl}/content/${contentId}/translate`, {
    method: 'POST',
    headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ target_language: targetLanguage })
  });
  return handleResponse<TranslationResponse>(response);
}
