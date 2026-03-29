import apiClient from './client';

// Get all conversations
export const getConversations = (page = 0, size = 20) =>
  apiClient.get('/messages/conversations', { params: { page, size } });

// Get conversation history with specific user
export const getConversation = (userId, page = 0, size = 50) =>
  apiClient.get(`/messages/conversations/${userId}`, { params: { page, size } });

// Backward-compatible alias used by MessageCenterPage
export const getMessages = (conversationId, page = 0, size = 50) =>
  apiClient.get(`/messages/conversation/${conversationId}`, { params: { page, size } });

// Send message to user
export const sendMessage = (recipientId, payloadOrContent) => {
  const content =
    typeof payloadOrContent === 'string'
      ? payloadOrContent
      : payloadOrContent?.content;
  return apiClient.post('/messages', { recipientId, content });
};

// Mark single message as read
export const markMessageRead = (messageId) =>
  apiClient.put(`/messages/${messageId}/read`);

// Mark all messages with user as read
export const markConversationRead = (userId) =>
  apiClient.put(`/messages/conversations/${userId}/read-all`);

// Delete message
export const deleteMessage = (conversationIdOrMessageId, maybeMessageId) => {
  const messageId = maybeMessageId ?? conversationIdOrMessageId;
  return apiClient.delete(`/messages/${messageId}`);
};

// Get unread message count
export const getUnreadCount = () =>
  apiClient.get('/messages/unread/count');

// Get unread messages from specific user
export const getUnreadMessages = (userId) =>
  apiClient.get(`/messages/conversations/${userId}/unread`);

// Search messages
export const searchMessages = (query) =>
  apiClient.get('/messages/search', { params: { q: query } });

// Get message statistics
export const getMessageStats = () =>
  apiClient.get('/messages/stats');
