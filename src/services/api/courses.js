import apiClient from './client';

export const listCourses = (params) => apiClient.get('/courses', { params });

export const getCourseDetail = (id) => apiClient.get(`/courses/${id}`);

export const enrollCourse = (id) => apiClient.post(`/courses/${id}/enroll`);

export const unenrollCourse = (id) => apiClient.delete(`/courses/${id}/enroll`);

export const getEnrolledCourses = () => apiClient.get('/courses/enrolled');

export const getCourseProgress = (id) => apiClient.get(`/courses/${id}/progress`);

export const updateCourseProgress = (id, data) =>
  apiClient.put(`/courses/${id}/progress`, data);

export const listDiscussions = (courseId, params) =>
  apiClient.get(`/courses/${courseId}/discussions`, { params });

export const createDiscussion = (courseId, data) =>
  apiClient.post(`/courses/${courseId}/discussions`, data);

export const rateCourse = (courseId, data) =>
  apiClient.post(`/courses/${courseId}/rating`, data);

export const getCourseRating = (courseId) =>
  apiClient.get(`/courses/${courseId}/rating`);

export const getCourseStats = (courseId) =>
  apiClient.get(`/courses/${courseId}/stats`);

export const listCourseResources = (courseId, params) =>
  apiClient.get(`/courses/${courseId}/resources`, { params });

export const downloadCourseResource = (courseId, resourceId) =>
  apiClient.get(`/courses/${courseId}/resources/${resourceId}/download`, { responseType: 'blob' });
