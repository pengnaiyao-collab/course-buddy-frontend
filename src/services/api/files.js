import apiClient from './client';

export const uploadFile = (formData, onUploadProgress) =>
  apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const listFiles = (params) => apiClient.get('/files', { params });

export const getFileDetail = (id) => apiClient.get(`/files/${id}`);

export const deleteFile = (id) => apiClient.delete(`/files/${id}`);

export const batchDelete = (ids) =>
  apiClient.post('/files/batch-delete', { ids });
