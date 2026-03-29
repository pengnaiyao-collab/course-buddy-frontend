import apiClient from './client';

// ── Permissions Management ───────────────────────────────────────────────

export const getPermissions = (resourceType, resourceId) =>
  apiClient.get(`/permissions/${resourceType}/${resourceId}`);

export const grantPermission = (resourceType, resourceId, userId, permissionLevel) =>
  apiClient.post(`/permissions/${resourceType}/${resourceId}`, { userId, permissionLevel });

export const updatePermission = (resourceType, resourceId, userId, permissionLevel) =>
  apiClient.put(`/permissions/${resourceType}/${resourceId}/${userId}`, { permissionLevel });

export const revokePermission = (resourceType, resourceId, userId) =>
  apiClient.delete(`/permissions/${resourceType}/${resourceId}/${userId}`);

export const listPermissions = (resourceType, params = {}) =>
  apiClient.get(`/permissions/${resourceType}`, { params });

// ── Prompt Library ───────────────────────────────────────────────────────

export const getPrompts = (params = {}) =>
  apiClient.get('/prompts', { params });

export const getPromptDetail = (id) =>
  apiClient.get(`/prompts/${id}`);

export const createPrompt = (data) =>
  apiClient.post('/prompts', data);

export const updatePrompt = (id, data) =>
  apiClient.put(`/prompts/${id}`, data);

export const deletePrompt = (id) =>
  apiClient.delete(`/prompts/${id}`);

export const favoritePrompt = (id) =>
  apiClient.post(`/prompts/${id}/favorite`);

export const unfavoritePrompt = (id) =>
  apiClient.delete(`/prompts/${id}/favorite`);

export const getPromptUsageStats = (id) =>
  apiClient.get(`/prompts/${id}/stats`);

// ── Knowledge Base Statistics ────────────────────────────────────────────

export const getKnowledgeStats = () =>
  apiClient.get('/knowledge/stats');

export const getKnowledgeGraph = (params = {}) =>
  apiClient.get('/knowledge/graph', { params });

export const reindexKnowledge = () =>
  apiClient.post('/knowledge/reindex');

export const getKnowledgeRecommendations = (userId) =>
  apiClient.get(`/knowledge/recommendations/${userId}`);
