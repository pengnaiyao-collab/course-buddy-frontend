import apiClient from './client';

// Get all notifications paginated
export const getNotifications = (filter = 'all', page = 0, size = 20) =>
  apiClient.get('/notifications', { params: { filter, page, size } });

// Get unread notification count
export const getUnreadCount = () =>
  apiClient.get('/notifications/unread/count');

// Mark single notification as read
export const markNotificationRead = (id) =>
  apiClient.put(`/notifications/${id}/read`);

// Mark all notifications as read
export const markAllNotificationsRead = () =>
  apiClient.put('/notifications/read-all');

// Delete single notification
export const deleteNotification = (id) =>
  apiClient.delete(`/notifications/${id}`);

// Clear all notifications
export const clearAllNotifications = () =>
  apiClient.delete('/notifications');

// Get notifications by type
export const getNotificationsByType = (type) =>
  apiClient.get(`/notifications/by-type/${type}`);

// Get notification statistics
export const getNotificationStats = () =>
  apiClient.get('/notifications/stats');

