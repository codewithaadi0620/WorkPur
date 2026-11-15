import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'indigo', name: 'Modern Indigo', color: '#4f46e5', icon: '✨' },
  { id: 'dark', name: 'Midnight Dark', color: '#1e293b', icon: '🌙' },
  { id: 'emerald', name: 'Emerald FinTech', color: '#059669', icon: '🌿' },
  { id: 'violet', name: 'Royal Violet', color: '#7c3aed', icon: '👑' },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'indigo';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);

    if (theme === 'dark') {
      root.classList.add('theme-dark', 'dark');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
    } else {
      root.classList.remove('theme-dark', 'dark');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
    }
  }, [theme]);

  const switchTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
