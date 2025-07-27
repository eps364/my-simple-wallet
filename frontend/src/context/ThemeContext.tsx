"use client";
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Theme, themes } from "@/lib/types/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof themes[Theme];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dracula-dark',
  setTheme: () => {},
  colors: themes['dracula-dark'],
});

interface ThemeProviderProps {
  readonly children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dracula-dark');

  useEffect(() => {
    // Carrega o tema do localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Aplica as variáveis CSS customizadas
    const root = document.documentElement;
    const themeColors = themes[theme];
    
    // Define as variáveis CSS customizadas
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-primary-hover', themeColors.primaryHover);
    root.style.setProperty('--color-secondary', themeColors.secondary);
    root.style.setProperty('--color-background', themeColors.background);
    root.style.setProperty('--color-surface', themeColors.surface);
    root.style.setProperty('--color-border', themeColors.border);
    root.style.setProperty('--color-text', themeColors.text);
    root.style.setProperty('--color-text-secondary', themeColors.textSecondary);
    root.style.setProperty('--color-text-muted', themeColors.textMuted);
    root.style.setProperty('--color-success', themeColors.success);
    root.style.setProperty('--color-warning', themeColors.warning);
    root.style.setProperty('--color-error', themeColors.error);
    root.style.setProperty('--color-info', themeColors.info);

    // Aplica a classe do tema no body para compatibilidade com Tailwind
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);

    // Salva o tema no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const contextValue = useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
    colors: themes[theme]
  }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
