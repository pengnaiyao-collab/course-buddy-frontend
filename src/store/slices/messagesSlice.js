import { createSlice } from '@reduxjs/toolkit';

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    activeConversationId: null,
    messages: {},
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.unreadCount = action.payload.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.lastMessage = message;
        conv.updatedAt = message.createdAt;
      }
    },
    updateMessage: (state, action) => {
      const { conversationId, messageId, content } = action.payload;
      const msgs = state.messages[conversationId];
      if (msgs) {
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) msg.content = content;
      }
    },
    removeMessage: (state, action) => {
      const { conversationId, messageId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter(
          (m) => m.id !== messageId
        );
      }
    },
    markConversationRead: (state, action) => {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        state.unreadCount = Math.max(0, state.unreadCount - (conv.unreadCount || 0));
        conv.unreadCount = 0;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  markConversationRead,
  setLoading,
  setError,
} = messagesSlice.actions;

export default messagesSlice.reducer;
