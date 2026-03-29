import apiClient from './client';

export const listNotes = (params) => apiClient.get('/notes', { params });

export const getNoteDetail = (id) => apiClient.get(`/notes/${id}`);

export const createNote = (data) => apiClient.post('/notes', data);

export const updateNote = (id, data) => apiClient.put(`/notes/${id}`, data);

export const deleteNote = (id) => apiClient.delete(`/notes/${id}`);

export const listCategories = () => apiClient.get('/notes/categories');

export const createCategory = (data) => apiClient.post('/notes/categories', data);

export const shareNote = (id, data) => apiClient.post(`/notes/${id}/share`, data);

export const getShareLink = (id) => apiClient.get(`/notes/${id}/share-link`);

export const exportNote = (id, format = 'pdf') =>
  apiClient.get(`/notes/${id}/export`, { params: { format }, responseType: 'blob' });

export const revokeShareLink = (id) => apiClient.delete(`/notes/${id}/share-link`);

// Version management
export const getNoteVersions = (noteId, params) =>
  apiClient.get(`/notes/${noteId}/versions`, { params });

export const getNoteVersionDiff = (noteId, versionId1, versionId2) =>
  apiClient.get(`/notes/${noteId}/versions/diff`, { params: { v1: versionId1, v2: versionId2 } });

export const restoreNoteVersion = (noteId, versionId) =>
  apiClient.post(`/notes/${noteId}/versions/${versionId}/restore`);

export const deleteNoteVersion = (noteId, versionId) =>
  apiClient.delete(`/notes/${noteId}/versions/${versionId}`);
