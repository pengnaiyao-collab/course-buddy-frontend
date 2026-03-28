import { createSlice } from '@reduxjs/toolkit';

const SETTINGS_KEY = 'courseBuddy_settings';

const defaultSettings = {
  language: localStorage.getItem('courseBuddy_language') || 'en_US',
  theme: localStorage.getItem('courseBuddy_theme') || 'auto',
  fontSize: 'medium',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  profileVisibility: 'public',
  showActivity: true,
  emailNotifications: true,
  appNotifications: true,
  courseNotifications: true,
  collaborationNotifications: true,
  systemNotifications: true,
};

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadSettings(),
  reducers: {
    updateSettings: (state, action) => {
      Object.assign(state, action.payload);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('courseBuddy_language', action.payload);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('courseBuddy_theme', action.payload);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
    },
  },
});

export const { updateSettings, setLanguage, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
