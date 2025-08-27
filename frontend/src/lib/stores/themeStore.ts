import { create } from 'zustand';
import { Theme } from '@/lib/types/theme';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dracula-dark', // Tema padrão inicial
  setTheme: (newTheme) => set({ theme: newTheme }),
}));
