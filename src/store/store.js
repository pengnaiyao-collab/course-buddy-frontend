import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import knowledgeReducer from './slices/knowledgeSlice';
import uploadReducer from './slices/uploadSlice';
import settingsReducer from './slices/settingsSlice';
import notificationsReducer from './slices/notificationsSlice';
import messagesReducer from './slices/messagesSlice';
import searchReducer from './slices/searchSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    knowledge: knowledgeReducer,
    upload: uploadReducer,
    settings: settingsReducer,
    notifications: notificationsReducer,
    messages: messagesReducer,
    search: searchReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setCredentials'],
      },
    }),
});

export default store;
