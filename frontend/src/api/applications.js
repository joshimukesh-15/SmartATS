import { apiClient } from './client';

export async function fetchApplication(applicationId) {
  return apiClient(`applications/${applicationId}`);
}

export async function updateApplicationStage(applicationId, { stage, note, changed_by }) {
  return apiClient(`applications/${applicationId}/stage`, {
    method: 'PATCH',
    body: { stage, note, changed_by },
  });
}

export async function addApplicationNote(applicationId, { content, author }) {
  return apiClient(`applications/${applicationId}/notes`, {
    method: 'POST',
    body: { content, author },
  });
}

export async function fetchApplicationHistory(applicationId) {
  return apiClient(`applications/${applicationId}/history`);
}
