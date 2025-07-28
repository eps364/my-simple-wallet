import { useTheme } from '@/context/ThemeContext';

/**
 * Hook que retorna estilos inline para usar com as cores do tema atual
 */
export function useThemeStyles() {
  const { colors } = useTheme();

  return {
    // Backgrounds
    background: { backgroundColor: colors.background },
    surface: { backgroundColor: colors.surface },
    primary: { backgroundColor: colors.primary },
    primaryHover: { backgroundColor: colors.primaryHover },
    
    // Text colors
    text: { color: colors.text },
    textSecondary: { color: colors.textSecondary },
    textMuted: { color: colors.textMuted },
    
    // Borders
    border: { borderColor: colors.border },
    
    // Status colors
    success: { color: colors.success },
    warning: { color: colors.warning },
    error: { color: colors.error },
    info: { color: colors.info },
    
    // Background status colors
    bgSuccess: { backgroundColor: colors.success },
    bgWarning: { backgroundColor: colors.warning },
    bgError: { backgroundColor: colors.error },
    bgInfo: { backgroundColor: colors.info },
    
    // Combinations
    card: { 
      backgroundColor: colors.surface, 
      borderColor: colors.border,
      color: colors.text 
    },
    button: {
      backgroundColor: colors.primary,
      color: colors.background,
    },
    buttonHover: {
      backgroundColor: colors.primaryHover,
      color: colors.background,
    }
  };
}

/**
 * Hook que retorna classes CSS que usam as variáveis do tema
 */
export function useThemeClasses() {
  return {
    // Backgrounds
    background: 'bg-theme-background',
    surface: 'bg-theme-surface',
    primary: 'bg-theme-primary hover:bg-theme-primary',
    
    // Text colors
    text: 'text-theme-primary',
    textSecondary: 'text-theme-secondary',
    textMuted: 'text-theme-muted',
    
    // Borders
    border: 'border-theme',
    
    // Status colors
    success: 'text-theme-success',
    warning: 'text-theme-warning',
    error: 'text-theme-error',
    info: 'text-theme-info',
    
    // Background status colors
    bgSuccess: 'bg-theme-success',
    bgWarning: 'bg-theme-warning',
    bgError: 'bg-theme-error',
    bgInfo: 'bg-theme-info',
    
    // Common combinations
    card: 'bg-theme-surface border border-theme text-theme-primary',
    button: 'bg-theme-primary text-white hover:bg-theme-primary',
  };
}
