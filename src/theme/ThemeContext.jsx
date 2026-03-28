import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { THEMES, lightTheme, darkTheme, getEffectiveTheme, getSavedTheme, saveTheme } from './themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(getSavedTheme);
  const effectiveTheme = getEffectiveTheme(themeMode);
  const isDark = effectiveTheme === THEMES.DARK;
  const currentTheme = isDark ? darkTheme : lightTheme;

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme, isDark]);

  // Listen for system theme changes when mode is AUTO
  useEffect(() => {
    if (themeMode !== THEMES.AUTO) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // Re-trigger effect by forcing re-render
      setThemeMode((prev) => prev);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  const switchTheme = useCallback((mode) => {
    setThemeMode(mode);
    saveTheme(mode);
  }, []);

  const antdConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: currentTheme.token,
  };

  return (
    <ThemeContext.Provider value={{ themeMode, effectiveTheme, isDark, switchTheme }}>
      <ConfigProvider theme={antdConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
