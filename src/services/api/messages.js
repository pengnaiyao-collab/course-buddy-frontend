import apiClient from './client';

export const getConversations = () =>
  apiClient.get('/messages/conversations');

export const getMessages = (conversationId, params) =>
  apiClient.get(`/messages/conversations/${conversationId}/messages`, { params });

export const sendMessage = (conversationId, data) =>
  apiClient.post(`/messages/conversations/${conversationId}/messages`, data);

export const editMessage = (conversationId, messageId, data) =>
  apiClient.put(`/messages/conversations/${conversationId}/messages/${messageId}`, data);

export const deleteMessage = (conversationId, messageId) =>
  apiClient.delete(`/messages/conversations/${conversationId}/messages/${messageId}`);

export const markConversationRead = (conversationId) =>
  apiClient.put(`/messages/conversations/${conversationId}/read`);

export const createConversation = (data) =>
  apiClient.post('/messages/conversations', data);
