import apiClient from './client';

export const listMembers = (params) =>
  apiClient.get('/permissions/members', { params });

export const inviteMember = (data) =>
  apiClient.post('/permissions/invite', data);

export const updateMemberPermission = (memberId, data) =>
  apiClient.put(`/permissions/members/${memberId}`, data);

export const removeMember = (memberId) =>
  apiClient.delete(`/permissions/members/${memberId}`);

export const getAuditLog = (params) =>
  apiClient.get('/permissions/audit-log', { params });
