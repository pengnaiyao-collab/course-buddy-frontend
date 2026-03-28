import apiClient from './client';

// ── Projects ──────────────────────────────────────────────────────────────────

export const listProjects = (params) =>
  apiClient.get('/collaboration/projects', { params });

export const getProjectDetail = (id) =>
  apiClient.get(`/collaboration/projects/${id}`);

export const createProject = (data) =>
  apiClient.post('/collaboration/projects', data);

export const updateProject = (id, data) =>
  apiClient.put(`/collaboration/projects/${id}`, data);

export const deleteProject = (id) =>
  apiClient.delete(`/collaboration/projects/${id}`);

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const listTasks = (projectId, params) =>
  apiClient.get(`/collaboration/projects/${projectId}/tasks`, { params });

export const createTask = (projectId, data) =>
  apiClient.post(`/collaboration/projects/${projectId}/tasks`, data);

export const updateTask = (projectId, taskId, data) =>
  apiClient.put(`/collaboration/projects/${projectId}/tasks/${taskId}`, data);

export const deleteTask = (projectId, taskId) =>
  apiClient.delete(`/collaboration/projects/${projectId}/tasks/${taskId}`);

// ── Members ───────────────────────────────────────────────────────────────────

export const listProjectMembers = (projectId) =>
  apiClient.get(`/collaboration/projects/${projectId}/members`);

export const inviteProjectMember = (projectId, data) =>
  apiClient.post(`/collaboration/projects/${projectId}/members`, data);

export const removeProjectMember = (projectId, memberId) =>
  apiClient.delete(`/collaboration/projects/${projectId}/members/${memberId}`);
