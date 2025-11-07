import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // initialize from localStorage or prefers-color-scheme
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pfm_dark');
      if (stored !== null) {
        setIsDark(stored === '1');
        return;
      }
    } catch (e) {}

    // if not set, detect system preference
    try {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    } catch (e) {}
  }, []);

  // apply class to documentElement and persist
  useEffect(() => {
    try {
      const el = document.documentElement;
      if (isDark) el.classList.add('dark'); else el.classList.remove('dark');
      localStorage.setItem('pfm_dark', isDark ? '1' : '0');
    } catch (e) {
      /* ignore */
    }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(d => !d), []);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
