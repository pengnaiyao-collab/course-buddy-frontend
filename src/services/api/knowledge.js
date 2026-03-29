import apiClient from './client';

const kbBase = (courseId) => `/courses/${courseId}/knowledge-base`;

export const listKnowledgePoints = (courseId, params) =>
  apiClient.get(kbBase(courseId), { params });

export const getKnowledgePoint = (courseId, id) =>
  apiClient.get(`${kbBase(courseId)}/${id}`);

export const createKnowledgePoint = (courseId, data) =>
  apiClient.post(kbBase(courseId), data);

export const updateKnowledgePoint = (courseId, id, data) =>
  apiClient.put(`${kbBase(courseId)}/${id}`, data);

export const deleteKnowledgePoint = (courseId, id) =>
  apiClient.delete(`${kbBase(courseId)}/${id}`);

export const searchKnowledgePoints = (courseId, keyword, params) =>
  apiClient.get(`${kbBase(courseId)}/search`, { params: { keyword, ...params } });

export const searchKnowledgePointsAdvanced = (courseId, { keyword, tags, tagMode = 'OR', ...params }) =>
  apiClient.get(`${kbBase(courseId)}/search/advanced`, {
    params: {
      keyword,
      tags: Array.isArray(tags) ? tags.join(',') : tags,
      tagMode,
      ...params,
    },
  });

export const autoAnalyzeKnowledge = (courseId, data) =>
  apiClient.post(`${kbBase(courseId)}/auto-analyze`, data);

export const getKnowledgeGraph = (courseId) =>
  apiClient.get(`${kbBase(courseId)}/graph`);

export const getKnowledgeMindmap = (courseId, id) =>
  apiClient.get(`${kbBase(courseId)}/${id}/mindmap`);

export const listKnowledgeResources = (courseId, id) =>
  apiClient.get(`${kbBase(courseId)}/${id}/resources`);

export const addKnowledgeResource = (courseId, id, data) =>
  apiClient.post(`${kbBase(courseId)}/${id}/resources`, data);

export const deleteKnowledgeResource = (courseId, id, resourceId) =>
  apiClient.delete(`${kbBase(courseId)}/${id}/resources/${resourceId}`);
