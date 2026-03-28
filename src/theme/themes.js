const THEME_KEY = 'courseBuddy_theme';

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

export const lightTheme = {
  mode: 'light',
  token: {
    colorPrimary: '#1677ff',
    colorBgBase: '#ffffff',
    colorTextBase: '#000000',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f7fa',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
  },
  cssVars: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f7fa',
    '--bg-elevated': '#ffffff',
    '--text-primary': '#000000',
    '--text-secondary': '#6b7280',
    '--border-color': '#e5e7eb',
    '--header-bg': '#1677ff',
    '--sidebar-bg': '#ffffff',
    '--sidebar-border': '#f0f0f0',
    '--active-bg': '#e6f4ff',
    '--active-color': '#1677ff',
    '--hover-bg': '#f5f5f5',
  },
};

export const darkTheme = {
  mode: 'dark',
  token: {
    colorPrimary: '#1677ff',
    colorBgBase: '#141414',
    colorTextBase: '#ffffff',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#2a2a2a',
    colorBgLayout: '#0d0d0d',
    colorBorder: '#3a3a3a',
    colorBorderSecondary: '#2a2a2a',
  },
  cssVars: {
    '--bg-primary': '#1f1f1f',
    '--bg-secondary': '#141414',
    '--bg-elevated': '#2a2a2a',
    '--text-primary': '#ffffff',
    '--text-secondary': '#9ca3af',
    '--border-color': '#3a3a3a',
    '--header-bg': '#111827',
    '--sidebar-bg': '#1f1f1f',
    '--sidebar-border': '#2a2a2a',
    '--active-bg': '#1e3a5f',
    '--active-color': '#4096ff',
    '--hover-bg': '#2a2a2a',
  },
};

export const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
};

export const getEffectiveTheme = (themeMode) => {
  if (themeMode === THEMES.AUTO) {
    return getSystemTheme();
  }
  return themeMode;
};

export const getSavedTheme = () => {
  return localStorage.getItem(THEME_KEY) || THEMES.AUTO;
};

export const saveTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
};
