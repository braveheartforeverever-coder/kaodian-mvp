'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Lang = 'zh';

interface AppContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  'app.title': { zh: '🎵 考点成歌' },
  'select.title': { zh: '选择一个考点，或粘贴你自己的内容' },
  'btn.generate_lyrics': { zh: '🎤 生成记忆歌词' },
};

const darkVars: Record<string, string> = {
  '--bg': '#0F172A',
  '--bg-card': '#1E293B',
  '--bg-hover': '#334155',
  '--bg-active': '#1E3A5F',
  '--text-primary': '#F1F5F9',
  '--text-secondary': '#94A3B8',
  '--text-tertiary': '#64748B',
  '--primary': '#3B82F6',
  '--primary-hover': '#60A5FA',
  '--primary-light': 'rgba(59,130,246,0.15)',
  '--success': '#10B981',
  '--success-light': 'rgba(16,185,129,0.15)',
  '--accent': '#F59E0B',
  '--accent-light': 'rgba(245,158,11,0.15)',
  '--danger': '#EF4444',
  '--danger-light': 'rgba(239,68,68,0.15)',
  '--border': '#334155',
  '--border-light': '#1E293B',
  '--shadow-sm': '0 1px 2px 0 rgba(0,0,0,0.3)',
  '--shadow-md': '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)',
  '--shadow-lg': '0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.4)',
};

const lightVars: Record<string, string> = {
  '--bg': '#F8FAFC',
  '--bg-card': '#FFFFFF',
  '--bg-hover': '#F1F5F9',
  '--bg-active': '#EFF6FF',
  '--text-primary': '#1E293B',
  '--text-secondary': '#475569',
  '--text-tertiary': '#94A3B8',
  '--primary': '#3B82F6',
  '--primary-hover': '#2563EB',
  '--primary-light': '#DBEAFE',
  '--success': '#10B981',
  '--success-light': '#D1FAE5',
  '--accent': '#F59E0B',
  '--accent-light': '#FEF3C7',
  '--danger': '#EF4444',
  '--danger-light': '#FEE2E2',
  '--border': '#E2E8F0',
  '--border-light': '#F1F5F9',
  '--shadow-sm': '0 1px 2px 0 rgba(0,0,0,0.05)',
  '--shadow-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
  '--shadow-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const vars = theme === 'dark' ? darkVars : lightVars;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
  // Also set html/body background directly
  root.style.background = vars['--bg'];
  document.body.style.background = vars['--bg'];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [lang] = useState<Lang>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme('light');
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    applyTheme(t);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, lang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
