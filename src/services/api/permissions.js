import apiClient from './client';

export const listMembers = (courseId) =>
  apiClient.get(`/v1/permissions/course/${courseId}/members`);

export const updateMemberPermission = (courseId, userId, permissionLevel) =>
  apiClient.put('/v1/permissions/update', { courseId, userId, permissionLevel });

export const removeMember = (courseId, userId) =>
  apiClient.delete('/v1/permissions/revoke', { params: { courseId, userId } });

export const getPermissionMatrix = (courseId) =>
  apiClient.get(`/v1/permissions/course/${courseId}/matrix`);

export const updatePermissionMatrix = (data) =>
  apiClient.put('/v1/permissions/matrix', data);

export const voteAdmin = (courseId, candidateUserId) =>
  apiClient.post('/v1/permissions/admin/vote', { courseId, candidateUserId });

export const rotateAdmin = (courseId, candidateUserId) =>
  apiClient.post('/v1/permissions/admin/rotate', { courseId, candidateUserId });

export const submitReview = (params) =>
  apiClient.post('/v1/reviews/submit', null, { params });

export const approveReview = (reviewId, reviewerId, comments) =>
  apiClient.post(`/v1/reviews/${reviewId}/approve`, null, { params: { reviewerId, comments } });

export const rejectReview = (reviewId, reviewerId, comments) =>
  apiClient.post(`/v1/reviews/${reviewId}/reject`, null, { params: { reviewerId, comments } });

export const takedownReview = (reviewId, reviewerId, reason) =>
  apiClient.post(`/v1/reviews/${reviewId}/violation/takedown`, null, { params: { reviewerId, reason } });

export const removeReview = (reviewId, reviewerId, reason) =>
  apiClient.post(`/v1/reviews/${reviewId}/violation/remove`, null, { params: { reviewerId, reason } });

export const listPendingReviews = (params) =>
  apiClient.get('/v1/reviews/pending', { params });
