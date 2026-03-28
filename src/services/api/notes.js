import apiClient from './client';

export const listNotes = (params) => apiClient.get('/notes', { params });

export const getNoteDetail = (id) => apiClient.get(`/notes/${id}`);

export const createNote = (data) => apiClient.post('/notes', data);

export const updateNote = (id, data) => apiClient.put(`/notes/${id}`, data);

export const deleteNote = (id) => apiClient.delete(`/notes/${id}`);

export const listCategories = () => apiClient.get('/notes/categories');

export const createCategory = (data) => apiClient.post('/notes/categories', data);
