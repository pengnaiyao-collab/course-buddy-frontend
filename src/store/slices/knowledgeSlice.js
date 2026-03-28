import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    totalFiles: 0,
    knowledgePoints: 0,
    members: 0,
    storageUsed: 0,
  },
  recentFiles: [],
  knowledgePoints: [],
  currentPoint: null,
  loading: false,
  error: null,
};

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState,
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setRecentFiles: (state, action) => {
      state.recentFiles = action.payload;
    },
    setKnowledgePoints: (state, action) => {
      state.knowledgePoints = action.payload;
    },
    setCurrentPoint: (state, action) => {
      state.currentPoint = action.payload;
    },
    addKnowledgePoint: (state, action) => {
      state.knowledgePoints.unshift(action.payload);
      state.stats.knowledgePoints += 1;
    },
    updateKnowledgePoint: (state, action) => {
      const idx = state.knowledgePoints.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.knowledgePoints[idx] = action.payload;
      if (state.currentPoint?.id === action.payload.id) {
        state.currentPoint = action.payload;
      }
    },
    removeKnowledgePoint: (state, action) => {
      state.knowledgePoints = state.knowledgePoints.filter(
        (p) => p.id !== action.payload
      );
      state.stats.knowledgePoints = Math.max(0, state.stats.knowledgePoints - 1);
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
  setStats,
  setRecentFiles,
  setKnowledgePoints,
  setCurrentPoint,
  addKnowledgePoint,
  updateKnowledgePoint,
  removeKnowledgePoint,
  setLoading,
  setError,
} = knowledgeSlice.actions;

export default knowledgeSlice.reducer;
