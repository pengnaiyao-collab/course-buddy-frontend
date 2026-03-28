import apiClient from './client';

/**
 * Generate AI content (review outline / key points / exercises)
 * @param {{ type: string, topic: string, fileIds?: string[], language?: string }} data
 */
export const generateContent = (data) => apiClient.post('/ai/generate', data);

/**
 * Stream AI content generation.
 * Returns a fetch Response so the caller can consume the ReadableStream.
 */
export const streamGenerate = async (data) => {
  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  return fetch(`${baseURL}/ai/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
};

/**
 * Get AI generation history
 */
export const getGenerationHistory = (params) =>
  apiClient.get('/ai/history', { params });

/**
 * Delete a generation history entry
 */
export const deleteGenerationHistory = (id) =>
  apiClient.delete(`/ai/history/${id}`);

/**
 * Get AI usage statistics for the current user
 */
export const getUsageStats = () => apiClient.get('/ai/stats');

/**
 * List prompt templates
 */
export const listPromptTemplates = (params) =>
  apiClient.get('/ai/prompts', { params });

/**
 * Create a custom prompt template
 */
export const createPromptTemplate = (data) =>
  apiClient.post('/ai/prompts', data);

/**
 * Delete a prompt template
 */
export const deletePromptTemplate = (id) =>
  apiClient.delete(`/ai/prompts/${id}`);
