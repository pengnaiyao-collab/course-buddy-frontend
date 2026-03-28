import apiClient from './client';

export const listVersions = (fileId) =>
  apiClient.get(`/versions`, { params: { fileId } });

export const getVersionDetail = (versionId) =>
  apiClient.get(`/versions/${versionId}`);

export const compareVersions = (versionIdA, versionIdB) =>
  apiClient.get(`/versions/compare`, { params: { a: versionIdA, b: versionIdB } });

export const rollbackVersion = (fileId, versionId) =>
  apiClient.post(`/versions/rollback`, { fileId, versionId });
