import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import knowledgeReducer from './slices/knowledgeSlice';
import uploadReducer from './slices/uploadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    knowledge: knowledgeReducer,
    upload: uploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setCredentials'],
      },
    }),
});

export default store;
