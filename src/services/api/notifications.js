import apiClient from './client';

export const getNotifications = (params) =>
  apiClient.get('/notifications', { params });

export const getUnreadCount = () =>
  apiClient.get('/notifications/unread/count');

export const markNotificationRead = (id) =>
  apiClient.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  apiClient.put('/notifications/read/all');

export const deleteNotification = (id) =>
  apiClient.delete(`/notifications/${id}`);

export const clearAllNotifications = () =>
  apiClient.delete('/notifications/all');
