"use client";
import { useTheme } from "@/context/ThemeContext";
import { Theme, themeLabels } from "@/lib/types/theme";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-3">
      <div className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
        Tema da Interface
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(themeLabels).map(([themeKey, label]) => (
          <button
            key={themeKey}
            type="button"
            onClick={() => handleThemeChange(themeKey as Theme)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200
              ${theme === themeKey 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: theme === themeKey ? 'var(--color-primary)' : 'var(--color-border)',
            }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <ThemePreview themeKey={themeKey as Theme} />
              </div>
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                {label}
              </span>
              {theme === themeKey && (
                <div 
                  className="absolute top-2 right-2 w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ThemePreviewProps {
  readonly themeKey: Theme;
}

function ThemePreview({ themeKey }: ThemePreviewProps) {
  const getPreviewColors = (themeKey: Theme) => {
    switch (themeKey) {
      case 'dark':
        return {
          bg: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc',
          accent: '#3b82f6'
        };
      case 'light':
        return {
          bg: '#ffffff',
          surface: '#f8fafc',
          text: '#0f172a',
          accent: '#3b82f6'
        };
      case 'pastel':
        return {
          bg: '#fdf2f8',
          surface: '#faf5ff',
          text: '#581c87',
          accent: '#8b5cf6'
        };
    }
  };

  const colors = getPreviewColors(themeKey);

  return (
    <div 
      className="w-12 h-8 rounded border overflow-hidden flex"
      style={{ backgroundColor: colors.bg }}
    >
      <div 
        className="flex-1"
        style={{ backgroundColor: colors.surface }}
      />
      <div 
        className="w-1"
        style={{ backgroundColor: colors.accent }}
      />
    </div>
  );
}
