import apiClient from './client';

/**
 * Send a question to the AI assistant (non-streaming)
 * @param {{ question: string, history?: Array }} data
 */
export const askQuestion = (data) => apiClient.post('/qa/ask', data);

/**
 * Get Q&A conversation history
 */
export const getQAHistory = (params) => apiClient.get('/qa/history', { params });

/**
 * Delete a conversation history entry
 */
export const deleteQAHistory = (id) => apiClient.delete(`/qa/history/${id}`);

/**
 * Stream a question to the AI assistant.
 * Returns a fetch Response so the caller can consume the ReadableStream.
 * @param {{ question: string, history?: Array }} data
 */
export const streamQuestion = async (data) => {
  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  return fetch(`${baseURL}/qa/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
};
