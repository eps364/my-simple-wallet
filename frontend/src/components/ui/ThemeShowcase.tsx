"use client";
import { Theme, themes, themeLabels } from "@/lib/types/theme";

interface ThemePreviewCardProps {
  readonly theme: Theme;
}

function ThemePreviewCard({ theme }: ThemePreviewCardProps) {
  const colors = themes[theme];
  
  return (
    <div 
      className="p-6 rounded-lg border-2 space-y-4"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text
      }}
    >
      <h3 
        className="text-lg font-bold"
        style={{ color: colors.text }}
      >
        {themeLabels[theme]}
      </h3>
      
      <div 
        className="p-4 rounded border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border
        }}
      >
        <h4 
          className="font-medium mb-2"
          style={{ color: colors.text }}
        >
          Card Exemplo
        </h4>
        <p 
          className="text-sm mb-3"
          style={{ color: colors.textSecondary }}
        >
          Texto secundário para demonstração
        </p>
        <p 
          className="text-xs"
          style={{ color: colors.textMuted }}
        >
          Texto menos importante
        </p>
      </div>

      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded text-sm font-medium"
          style={{
            backgroundColor: colors.primary,
            color: colors.background
          }}
        >
          Primário
        </button>
        <button
          className="px-3 py-1 rounded text-sm font-medium"
          style={{
            backgroundColor: colors.success,
            color: colors.background
          }}
        >
          Sucesso
        </button>
        <button
          className="px-3 py-1 rounded text-sm font-medium"
          style={{
            backgroundColor: colors.error,
            color: colors.background
          }}
        >
          Erro
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <div 
            className="w-4 h-4 rounded border inline-block mr-2"
            style={{ backgroundColor: colors.background }}
          />
          Background
        </div>
        <div>
          <div 
            className="w-4 h-4 rounded border inline-block mr-2"
            style={{ backgroundColor: colors.surface }}
          />
          Surface
        </div>
        <div>
          <div 
            className="w-4 h-4 rounded border inline-block mr-2"
            style={{ backgroundColor: colors.primary }}
          />
          Primary
        </div>
        <div>
          <div 
            className="w-4 h-4 rounded border inline-block mr-2"
            style={{ backgroundColor: colors.border }}
          />
          Border
        </div>
      </div>
    </div>
  );
}

export function ThemeShowcase() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Preview dos Temas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(themes).map((themeKey) => (
          <ThemePreviewCard 
            key={themeKey} 
            theme={themeKey as Theme} 
          />
        ))}
      </div>
    </div>
  );
}
