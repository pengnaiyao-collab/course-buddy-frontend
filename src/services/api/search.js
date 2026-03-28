import apiClient from './client';

export const globalSearch = (query, params) =>
  apiClient.get('/search', { params: { q: query, ...params } });

export const getSearchSuggestions = (query) =>
  apiClient.get('/search/suggestions', { params: { q: query } });

export const getSearchHistory = () =>
  apiClient.get('/search/history');

export const deleteSearchHistory = (query) =>
  apiClient.delete('/search/history', { params: { q: query } });

export const clearSearchHistory = () =>
  apiClient.delete('/search/history/all');
