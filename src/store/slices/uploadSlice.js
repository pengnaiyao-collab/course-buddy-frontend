import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  queue: [],       // { uid, name, size, type, status, progress, error, url }
  history: [],     // completed uploads (success or error)
  uploading: false,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addToQueue: (state, action) => {
      state.queue.push({ ...action.payload, status: 'pending', progress: 0 });
    },
    startUpload: (state, action) => {
      state.uploading = true;
      const item = state.queue.find((f) => f.uid === action.payload);
      if (item) item.status = 'uploading';
    },
    updateProgress: (state, action) => {
      const { uid, progress } = action.payload;
      const item = state.queue.find((f) => f.uid === uid);
      if (item) item.progress = progress;
    },
    uploadSuccess: (state, action) => {
      const { uid, url } = action.payload;
      const item = state.queue.find((f) => f.uid === uid);
      if (item) {
        item.status = 'success';
        item.progress = 100;
        item.url = url;
        state.history.unshift({ ...item, completedAt: new Date().toISOString() });
      }
      state.uploading = state.queue.some((f) => f.status === 'uploading');
    },
    uploadError: (state, action) => {
      const { uid, error } = action.payload;
      const item = state.queue.find((f) => f.uid === uid);
      if (item) {
        item.status = 'error';
        item.error = error;
        state.history.unshift({ ...item, completedAt: new Date().toISOString() });
      }
      state.uploading = state.queue.some((f) => f.status === 'uploading');
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter((f) => f.uid !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
      state.uploading = false;
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const {
  addToQueue,
  startUpload,
  updateProgress,
  uploadSuccess,
  uploadError,
  removeFromQueue,
  clearQueue,
  clearHistory,
} = uploadSlice.actions;

export default uploadSlice.reducer;
