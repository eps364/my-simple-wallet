import { create } from 'zustand';
import { Theme } from '@/lib/types/theme';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dracula-dark', 
  setTheme: (newTheme) => set({ theme: newTheme }),
}));
