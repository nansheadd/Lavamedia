import type {
  ChangeRequestDecisionPayload,
  ChangeRequestDTO,
  ChangeRequestPayload
} from './types';

const baseUrl = '/api/editorial';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Une erreur est survenue.');
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function fetchChangeRequests(contentId: number): Promise<ChangeRequestDTO[]> {
  const response = await fetch(`${baseUrl}/content/${contentId}/changes`);
  return handleResponse<ChangeRequestDTO[]>(response);
}

export async function createChangeRequest(
  contentId: number,
  payload: ChangeRequestPayload
): Promise<ChangeRequestDTO> {
  const response = await fetch(`${baseUrl}/content/${contentId}/changes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<ChangeRequestDTO>(response);
}

export async function exportDocx(contentId: number): Promise<Blob> {
  const response = await fetch(`${baseUrl}/content/${contentId}/export/docx`, {
    method: 'POST'
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Impossible d'exporter le document");
  }
  return await response.blob();
}
