import apiClient from './client';

// ── Audit Logs ───────────────────────────────────────────────────────────

export const getAuditLogs = (params = {}) =>
  apiClient.get('/audit-logs', { params });

export const getAuditLogsByResource = (resourceType, resourceId, params = {}) =>
  apiClient.get(`/audit-logs/${resourceType}/${resourceId}`, { params });

export const getAuditLogsByUser = (userId, params = {}) =>
  apiClient.get(`/audit-logs/user/${userId}`, { params });

export const getAuditLogDetail = (id) =>
  apiClient.get(`/audit-logs/${id}`);

// ── File Operations ─────────────────────────────────────────────────────

export const uploadFile = (file, path = '/') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);
  return apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteFile = (fileId) =>
  apiClient.delete(`/files/${fileId}`);

export const getFile = (fileId) =>
  apiClient.get(`/files/${fileId}`);

export const listFiles = (params = {}) =>
  apiClient.get('/files', { params });

export const downloadFile = (fileId) =>
  apiClient.get(`/files/${fileId}/download`, { responseType: 'blob' });

export const shareFile = (fileId, permissions) =>
  apiClient.post(`/files/${fileId}/share`, { permissions });

export const getFileVersions = (fileId) =>
  apiClient.get(`/files/${fileId}/versions`);

// ── File Sharing ─────────────────────────────────────────────────────────

export const getShareLinks = (params = {}) =>
  apiClient.get('/files/shares', { params });

export const createShareLink = (fileId, expiresAt, permission = 'READ') =>
  apiClient.post('/files/shares', { fileId, expiresAt, permission });

export const deleteShareLink = (shareId) =>
  apiClient.delete(`/files/shares/${shareId}`);

export const getShareByToken = (token) =>
  apiClient.get(`/files/shares/token/${token}`);
