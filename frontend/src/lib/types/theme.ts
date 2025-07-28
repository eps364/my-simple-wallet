export type Theme = 'dracula-dark' | 'dracula-light' | 'dark' | 'light' | 'pastel';

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
  'dracula-dark': {
    primary: '#bd93f9',      // Purple
    primaryHover: '#a582e6', // Darker Purple
    secondary: '#6272a4',    // Comment (grayish blue)
    background: '#282a36',   // Background
    surface: '#44475a',      // Current line
    border: '#6272a4',       // Comment
    text: '#f8f8f2',         // Foreground
    textSecondary: '#f8f8f2', // Foreground
    textMuted: '#6272a4',    // Comment
    success: '#50fa7b',      // Green
    warning: '#ffb86c',      // Orange
    error: '#ff5555',        // Red
    info: '#8be9fd',         // Cyan
  },
  'dracula-light': {
    primary: '#7c3aed',      // Adapted purple for light theme
    primaryHover: '#6d28d9', // Darker adapted purple
    secondary: '#64748b',    // Slate gray
    background: '#f8f8f2',   // Light background (Dracula foreground adapted)
    surface: '#ffffff',      // Pure white surface
    border: '#e2e8f0',       // Light border
    text: '#282a36',         // Dark text (Dracula background)
    textSecondary: '#44475a', // Secondary text (Dracula current line)
    textMuted: '#6272a4',    // Muted text (Dracula comment)
    success: '#16a34a',      // Adapted green for light theme
    warning: '#ea580c',      // Adapted orange for light theme
    error: '#dc2626',        // Adapted red for light theme
    info: '#0891b2',         // Adapted cyan for light theme
  },
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
  'dracula-dark': 'Dracula Dark',
  'dracula-light': 'Dracula Light',
  dark: 'Escuro',
  light: 'Claro',
  pastel: 'Pastel',
};
