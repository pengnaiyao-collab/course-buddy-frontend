import apiClient from './client';

const resolveApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  if (base.startsWith('http')) {
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  return base;
};

export const uploadFile = (formData, onUploadProgress) =>
  apiClient.post('/v1/files/upload/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const uploadFileWithCategory = (file, category, onUploadProgress) => {
  const formData = new FormData();
  formData.append('files', file);
  if (category) formData.append('category', category);

  // Use fetch here to ensure '/api' context path is present in development.
  const token = localStorage.getItem('token');
  const baseURL = resolveApiBase();
  return fetch(`${baseURL}/v1/files/upload/batch`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
};

export const listFiles = (params) => apiClient.get('/files', { params });

export const getFileDetail = (id) => apiClient.get(`/files/${id}`);

export const deleteFile = (id) => apiClient.delete(`/files/${id}`);

export const batchDelete = (ids) =>
  apiClient.post('/files/batch-delete', { ids });
