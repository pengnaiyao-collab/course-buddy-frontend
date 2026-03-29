import apiClient from './client';

// ── Note Sharing ───────────────────────────────────────────────────────────────

export const shareNote = (noteId, permissions) =>
  apiClient.post(`/notes/${noteId}/share`, { permission: permissions });

export const getShareLinks = (noteId) =>
  apiClient.get(`/notes/${noteId}/share`);

export const revokeShareLink = (shareId) =>
  apiClient.delete(`/notes/${shareId}/share`);

// ── Note Export ────────────────────────────────────────────────────────────────

export const exportToPdf = (noteId) =>
  apiClient.get(`/notes/${noteId}/export/pdf`, { responseType: 'blob' });

export const exportToMarkdown = (noteId) =>
  apiClient.get(`/notes/${noteId}/export/markdown`, { responseType: 'blob' });

export const exportToHtml = (noteId) =>
  apiClient.get(`/notes/${noteId}/export/html`, { responseType: 'blob' });

// ── Version Management ────────────────────────────────────────────────────────

export const getVersionHistory = (noteId, page = 0, size = 10) =>
  apiClient.get(`/notes/${noteId}/versions`, { params: { page, size } });

export const getVersionDiff = (noteId, versionId1, versionId2) =>
  apiClient.get(`/notes/${noteId}/versions/${versionId1}/diff/${versionId2}`);

export const restoreVersion = (noteId, versionId) =>
  apiClient.post(`/notes/${noteId}/versions/${versionId}/restore`);

export const deleteVersion = (noteId, versionId) =>
  apiClient.delete(`/notes/${noteId}/versions/${versionId}`);

// ── Note Search ────────────────────────────────────────────────────────────────

export const searchNotes = (query, size = 20) =>
  apiClient.get('/notes/search', { params: { q: query, size } });

// ── Note Statistics ────────────────────────────────────────────────────────────

export const getNoteStats = () =>
  apiClient.get('/notes/stats');
