"use client";
import { useTheme } from "@/context/ThemeContext";
import { Theme, themeLabels } from "@/lib/types/theme";

interface ThemeButtonProps {
  readonly themeKey: Theme;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly featured?: boolean;
}

function ThemeButton({ themeKey, isSelected, onClick, featured = false }: ThemeButtonProps) {
  const label = themeLabels[themeKey];
  
  // Calculate box shadow
  let boxShadow: string | undefined;
  if (isSelected) {
    const shadowColor = featured ? '189, 147, 249' : '59, 130, 246';
    boxShadow = `0 0 0 2px var(--color-primary), 0 0 0 4px rgba(${shadowColor}, 0.1)`;
  } else if (featured) {
    boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  }
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-opacity-20' 
          : 'hover:scale-105'
        }
        ${featured ? 'shadow-lg' : ''}
      `}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
        boxShadow,
      }}
    >
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <ThemePreview themeKey={themeKey} />
        </div>
        <span 
          className={`text-sm font-medium ${featured ? 'font-semibold' : ''}`}
          style={{ color: 'var(--color-text)' }}
        >
          {label}
        </span>
        {isSelected && (
          <div 
            className="absolute top-2 right-2 w-3 h-3 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <svg 
              className="w-2 h-2 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {featured && !isSelected && (
          <div 
            className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded"
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'white',
              fontSize: '9px'
            }}
          >
            NEW
          </div>
        )}
      </div>
    </button>
  );
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  // Organizar temas em categorias
  const draculaThemes: Theme[] = ['dracula-dark', 'dracula-light'];
  const standardThemes: Theme[] = ['dark', 'light', 'pastel'];

  return (
    <div className="space-y-6">
      <div className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
        Tema da Interface
      </div>
      
      {/* Temas Dracula em destaque */}
      <div>
        <div 
          className="text-xs font-medium mb-3 flex items-center gap-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span>🧛 Temas Dracula</span>
          <div 
            className="flex-1 h-px"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {draculaThemes.map((themeKey) => (
            <ThemeButton
              key={themeKey}
              themeKey={themeKey}
              isSelected={theme === themeKey}
              onClick={() => handleThemeChange(themeKey)}
              featured={true}
            />
          ))}
        </div>
      </div>

      {/* Temas padrão */}
      <div>
        <div 
          className="text-xs font-medium mb-3 flex items-center gap-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span>🎨 Temas Clássicos</span>
          <div 
            className="flex-1 h-px"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {standardThemes.map((themeKey) => (
            <ThemeButton
              key={themeKey}
              themeKey={themeKey}
              isSelected={theme === themeKey}
              onClick={() => handleThemeChange(themeKey)}
            />
          ))}
        </div>
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
      case 'dracula-dark':
        return {
          bg: '#282a36',
          surface: '#44475a',
          text: '#f8f8f2',
          accent: '#bd93f9'
        };
      case 'dracula-light':
        return {
          bg: '#f8f8f2',
          surface: '#ffffff',
          text: '#282a36',
          accent: '#7c3aed'
        };
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
