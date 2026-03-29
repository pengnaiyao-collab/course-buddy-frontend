import apiClient from './client';

// Profile Management
export const getUserProfile = (userIdentifier) =>
  apiClient.get(userIdentifier ? `/users/${userIdentifier}` : '/users/me');

export const updateUserProfile = (data) =>
  apiClient.put('/users/profile', data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteAvatar = () =>
  apiClient.delete('/users/avatar');

// User Search
export const searchUsers = (keyword) =>
  apiClient.get('/users/search', { params: { keyword } });

// Followers
export const getFollowers = (userId, page = 0, size = 20) =>
  apiClient.get(`/users/${userId}/followers`, { params: { page, size } });

export const getFollowing = (userId, page = 0, size = 20) =>
  apiClient.get(`/users/${userId}/following`, { params: { page, size } });

export const followUser = (userId) =>
  apiClient.post(`/users/${userId}/follow`);

export const unfollowUser = (userId) =>
  apiClient.delete(`/users/${userId}/follow`);

// User Statistics
export const getUserStatistics = (userId) =>
  apiClient.get(`/users/${userId}/statistics`);

// Settings
export const getSettings = () =>
  apiClient.get('/users/settings');

export const updateSettings = (data) =>
  apiClient.put('/users/settings', data);

// Get Current User Info
export const getCurrentUser = () =>
  apiClient.get('/users/me');

