import { create } from 'zustand';

export type ThemeId = 'dark-navy' | 'dark-slate' | 'light';

export interface Theme {
  id: ThemeId;
  label: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  cardBg: string;
  cardHover: string;
  panelBg: string;
  statusBg: string;
  inputBg: string;
  fabColor: string;
  fabMenuBg: string;
  servisColor: string;
  musteriColor: string;
  arabaColor: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  'dark-navy': {
    id: 'dark-navy',
    label: 'Lacivert',
    bg: '#1c2340',
    surface: '#151b35',
    border: 'rgba(255,255,255,0.08)',
    text: '#e8eaff',
    textMuted: 'rgba(255,255,255,0.38)',
    accent: '#7b8fff',
    accentHover: '#6a7fff',
    cardBg: 'rgba(255,255,255,0.05)',
    cardHover: 'rgba(255,255,255,0.09)',
    panelBg: '#151b35',
    statusBg: '#111729',
    inputBg: 'rgba(255,255,255,0.07)',
    fabColor: '#7b8fff',
    fabMenuBg: '#1e2847',
    servisColor: '#7b8fff',
    musteriColor: '#2dd4b8',
    arabaColor: '#fbbf24',
  },
  'dark-slate': {
    id: 'dark-slate',
    label: 'Slate',
    bg: '#0f1623',
    surface: '#0a1019',
    border: 'rgba(255,255,255,0.06)',
    text: '#e2e8f0',
    textMuted: 'rgba(255,255,255,0.3)',
    accent: '#38bdf8',
    accentHover: '#29abdf',
    cardBg: 'rgba(255,255,255,0.04)',
    cardHover: 'rgba(56,189,248,0.07)',
    panelBg: '#0a1019',
    statusBg: '#060c14',
    inputBg: 'rgba(255,255,255,0.05)',
    fabColor: '#38bdf8',
    fabMenuBg: '#0d1929',
    servisColor: '#38bdf8',
    musteriColor: '#34d399',
    arabaColor: '#fbbf24',
  },
  light: {
    id: 'light',
    label: 'Açık',
    bg: '#f0f2f8',
    surface: '#ffffff',
    border: 'rgba(0,0,0,0.08)',
    text: '#1e293b',
    textMuted: '#94a3b8',
    accent: '#4f5bff',
    accentHover: '#3f4bef',
    cardBg: '#ffffff',
    cardHover: '#f8f9ff',
    panelBg: '#ffffff',
    statusBg: '#e8ecf4',
    inputBg: '#f1f5f9',
    fabColor: '#4f5bff',
    fabMenuBg: '#ffffff',
    servisColor: '#4f5bff',
    musteriColor: '#0d9488',
    arabaColor: '#d97706',
  },
};

interface ThemeStore {
  themeId: ThemeId;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeId: 'dark-navy',
  theme: THEMES['dark-navy'],
  setTheme: (id) => set({ themeId: id, theme: THEMES[id] }),
}));