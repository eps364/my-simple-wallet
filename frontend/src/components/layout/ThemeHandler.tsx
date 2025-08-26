'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/themeStore';
import { themes } from '@/lib/types/theme';

export function ThemeHandler() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  // Efeito para carregar o tema do localStorage na inicialização (apenas no cliente)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as keyof typeof themes;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez

  // Efeito para aplicar o tema no DOM e salvar no localStorage quando ele mudar
  useEffect(() => {
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

  return null; // Este componente não renderiza nada
}
