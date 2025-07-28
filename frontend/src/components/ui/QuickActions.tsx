"use client";
import Link from 'next/link';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

interface QuickAction {
  readonly href: string;
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly color: 'primary' | 'success' | 'secondary' | 'warning' | 'error';
}

interface QuickActionsProps {
  readonly className?: string;
}

export default function QuickActions({ className = '' }: QuickActionsProps) {
  const styles = useThemeStyles();
  
  const actions: QuickAction[] = [
    {
      href: '/profile',
      title: 'Meu Perfil',
      description: 'Gerencie suas informações pessoais',
      color: 'primary',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      href: '/accounts',
      title: 'Contas',
      description: 'Gerencie suas contas bancárias',
      color: 'success',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      href: '/categories',
      title: 'Categorias',
      description: 'Organize suas categorias',
      color: 'secondary',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      href: '/transactions',
      title: 'Transações',
      description: 'Registre suas movimentações',
      color: 'warning',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];

  const getColorStyle = (color: QuickAction['color']) => {
    const colorMap = {
      primary: 'var(--color-primary)',
      success: 'var(--color-success)', 
      secondary: 'var(--color-secondary)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)'
    };
    return colorMap[color];
  };

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {actions.map((action) => {
        const accentColor = getColorStyle(action.color);
        return (
          <Link
            key={action.href}
            href={action.href}
            className="p-4 rounded-lg border transition-all"
            style={{
              ...styles.surface,
              borderColor: styles.border.borderColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background)';
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.surface.backgroundColor;
              e.currentTarget.style.borderColor = styles.border.borderColor;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div 
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: accentColor + '20',
                  color: accentColor 
                }}
              >
                {action.icon}
              </div>
              <h3 
                className="font-medium"
                style={styles.text}
              >
                {action.title}
              </h3>
              <p 
                className="text-sm"
                style={styles.textSecondary}
              >
                {action.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
