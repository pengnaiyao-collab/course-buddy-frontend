import apiClient from './client';

/**
 * Send a question to the AI assistant (non-streaming)
 * @param {{ question: string, conversationId?: number, courseId?: number }} data
 */
export const askQuestion = (data) => apiClient.post('/v1/ai/chat', {
  message: data.question,
  conversationId: data.conversationId,
  courseId: data.courseId,
  includeHistory: data.includeHistory ?? true,
  includeKnowledgeContext: data.includeKnowledgeContext ?? true,
});

/**
 * Get Q&A conversation history
 */
export const getQAHistory = (params) => apiClient.get('/v1/ai/conversations', { params });

/**
 * Delete a conversation history entry
 */
export const deleteQAHistory = (id) => apiClient.delete(`/v1/ai/conversations/${id}`);

/**
 * Stream a question to the AI assistant.
 * Returns a fetch Response so the caller can consume the ReadableStream.
 * @param {{ question: string, history?: Array }} data
 */
export const streamQuestion = async (data) => {
  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  return fetch(`${baseURL}/v1/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message: data.question,
      conversationId: data.conversationId,
      courseId: data.courseId,
      includeHistory: data.includeHistory ?? true,
      includeKnowledgeContext: data.includeKnowledgeContext ?? true,
    }),
  });
};
