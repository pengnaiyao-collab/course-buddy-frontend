import { createSlice } from '@reduxjs/toolkit';

const SEARCH_HISTORY_KEY = 'courseBuddy_searchHistory';

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
};

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    activeTab: 'all',
    history: loadHistory(),
    suggestions: [],
    loading: false,
    error: null,
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setResults: (state, action) => {
      state.results = action.payload;
      state.loading = false;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    addToHistory: (state, action) => {
      const query = action.payload;
      state.history = [query, ...state.history.filter((h) => h !== query)].slice(0, 10);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(state.history));
    },
    removeFromHistory: (state, action) => {
      state.history = state.history.filter((h) => h !== action.payload);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(state.history));
    },
    clearHistory: (state) => {
      state.history = [];
      localStorage.removeItem(SEARCH_HISTORY_KEY);
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
  setQuery,
  setResults,
  setActiveTab,
  setSuggestions,
  addToHistory,
  removeFromHistory,
  clearHistory,
  setLoading,
  setError,
} = searchSlice.actions;

export default searchSlice.reducer;
