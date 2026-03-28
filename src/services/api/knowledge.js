import apiClient from './client';

export const getKnowledgeStats = () => apiClient.get('/knowledge/stats');

export const listKnowledgePoints = (params) =>
  apiClient.get('/knowledge/points', { params });

export const getKnowledgePoint = (id) => apiClient.get(`/knowledge/points/${id}`);

export const createKnowledgePoint = (data) =>
  apiClient.post('/knowledge/points', data);

export const updateKnowledgePoint = (id, data) =>
  apiClient.put(`/knowledge/points/${id}`, data);

export const deleteKnowledgePoint = (id) =>
  apiClient.delete(`/knowledge/points/${id}`);

export const searchKnowledgePoints = (query, params) =>
  apiClient.get('/knowledge/search', { params: { q: query, ...params } });
