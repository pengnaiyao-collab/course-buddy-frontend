import { createSlice } from '@reduxjs/toolkit';

const wsSlice = createSlice({
  name: 'websocket',
  initialState: {
    connected: false,
    connecting: false,
    messages: [],
    onlineUsers: [],
    collaborationUpdates: [],
    lastUpdate: null,
    error: null,
  },
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
      state.connecting = false;
    },
    setConnecting: (state, action) => {
      state.connecting = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      state.lastUpdate = new Date().toISOString();
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addCollaborationUpdate: (state, action) => {
      state.collaborationUpdates.push(action.payload);
      state.lastUpdate = new Date().toISOString();
    },
    clearCollaborationUpdates: (state) => {
      state.collaborationUpdates = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setConnected,
  setConnecting,
  addMessage,
  clearMessages,
  setOnlineUsers,
  addCollaborationUpdate,
  clearCollaborationUpdates,
  setError,
  clearError,
} = wsSlice.actions;

export default wsSlice.reducer;
