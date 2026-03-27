import apiClient from './client';

/**
 * Login with username and password
 * @param {{ username: string, password: string }} credentials
 */
export const login = (credentials) =>
  apiClient.post('/auth/login', credentials);

/**
 * Register a new user
 * @param {{ username: string, password: string, email: string }} data
 */
export const register = (data) =>
  apiClient.post('/auth/register', data);

/**
 * Fetch the current authenticated user's profile
 */
export const getProfile = () =>
  apiClient.get('/auth/me');

/**
 * Logout (server-side invalidation, if supported)
 */
export const logoutApi = () =>
  apiClient.post('/auth/logout');
