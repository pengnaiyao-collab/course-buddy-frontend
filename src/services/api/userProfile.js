import apiClient from './client';

export const getUserProfile = (userId) =>
  apiClient.get(userId ? `/users/${userId}/profile` : '/users/me/profile');

export const updateUserProfile = (data) =>
  apiClient.put('/users/me/profile', data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteAvatar = () =>
  apiClient.delete('/users/me/avatar');
