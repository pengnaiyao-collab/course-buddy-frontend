import apiClient from './client';

export const getUserSettings = () =>
  apiClient.get('/users/me/settings');

export const updateUserSettings = (data) =>
  apiClient.put('/users/me/settings', data);

export const changePassword = (data) =>
  apiClient.put('/users/me/password', data);

export const getLoginHistory = (params) =>
  apiClient.get('/users/me/login-history', { params });

export const getDevices = () =>
  apiClient.get('/users/me/devices');

export const removeDevice = (deviceId) =>
  apiClient.delete(`/users/me/devices/${deviceId}`);

export const exportUserData = () =>
  apiClient.get('/users/me/export', { responseType: 'blob' });

export const deleteAccount = (data) =>
  apiClient.delete('/users/me', { data });
