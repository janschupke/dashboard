import React, { createContext, useState, useCallback, useMemo, useLayoutEffect } from 'react';

import { useStorageManager, AppTheme } from '../services/storageManager';
import { THEME_TOKENS } from '../theme/tokens';

import type { ThemeContextType } from '../theme/types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = React.memo<{ children: React.ReactNode }>(({ children }) => {
  const storage = useStorageManager();
  // Get initial theme from storage manager or system preference
  const getInitialTheme = (): AppTheme => {
    const config = storage.getAppConfig();
    if (config?.theme) return config.theme;
    if (typeof window !== 'undefined') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return AppTheme.dark;
      }
    }
    return AppTheme.light;
  };

  const [theme, setTheme] = useState<AppTheme>(getInitialTheme());

  // Persist theme to storage manager and set document attribute
  useLayoutEffect(() => {
    storage.setAppConfig({ ...storage.getAppConfig(), theme });
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === AppTheme.dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, storage]);

  const toggleTheme = useCallback(() => {
    setTheme((prev: AppTheme) => (prev === AppTheme.light ? AppTheme.dark : AppTheme.light));
  }, []);

  const setThemeMode = useCallback((newTheme: AppTheme) => {
    setTheme(newTheme);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme: setThemeMode,
      tokens: THEME_TOKENS,
    }),
    [theme, toggleTheme, setThemeMode],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
});

export { ThemeContext };
