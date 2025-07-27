export type Theme = 'dark' | 'light' | 'pastel';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#64748b',
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#f8fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
  },
  light: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0891b2',
  },
  pastel: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    secondary: '#a78bfa',
    background: '#fdf2f8',
    surface: '#faf5ff',
    border: '#e9d5ff',
    text: '#581c87',
    textSecondary: '#7c2d92',
    textMuted: '#a855f7',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0891b2',
  },
};

export const themeLabels: Record<Theme, string> = {
  dark: 'Escuro',
  light: 'Claro',
  pastel: 'Pastel',
};
