"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/lib/services/usersService';
import { clearAuthData } from '@/lib/apiService';
import { User } from '@/lib/types/user';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

interface UserMenuProps {
  readonly onLogout?: () => void;
}

const getFamilyManagementEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('familyManagementEnabled') === 'true';
};

const setFamilyManagementEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('familyManagementEnabled', enabled.toString());
  window.dispatchEvent(new CustomEvent('familyManagementChanged'));
};

export default function UserMenu({ onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyManagementEnabled, setFamilyManagementEnabledState] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const styles = useThemeStyles();

  const getDisplayFirstName = (user: User): string => {
    if (user.name) {
      return user.name.trim().split(' ')[0];
    }
    return user.username;
  };

  const loadUserProfile = useCallback(async () => {
    try {
      const userData = await usersService.getProfile();
      setUser(userData);
    } catch {
      clearAuthData();
      if (onLogout) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    loadUserProfile();
    
    setFamilyManagementEnabledState(getFamilyManagementEnabled());
    
    const handleStorageChange = () => {
      setFamilyManagementEnabledState(getFamilyManagementEnabled());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('familyManagementChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('familyManagementChanged', handleStorageChange);
    };
  }, [loadUserProfile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setIsOpen(false);
    if (onLogout) onLogout();
    router.push('/login');
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push('/profile');
  };

  const handleAccountsClick = () => {
    setIsOpen(false);
    router.push('/accounts');
  };

  const handleCategoriesClick = () => {
    setIsOpen(false);
    router.push('/categories');
  };

  const handleTransactionsClick = () => {
    setIsOpen(false);
    router.push('/transactions');
  };

  const handleReportsClick = () => {
    setIsOpen(false);
    router.push('/reports');
  };

   const handleExportClick = () => {
    setIsOpen(false);
    router.push('/export');
  };

   const handleImportClick = () => {
    setIsOpen(false);
    router.push('/import');
  };

  const handleToggleFamilyManagement = () => {
    const newValue = !familyManagementEnabled;
    setFamilyManagementEnabled(newValue);
    setFamilyManagementEnabledState(newValue);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--color-border)' }}
        ></div>
        <div 
          className="w-20 h-4 rounded animate-pulse"
          style={{ backgroundColor: 'var(--color-border)' }}
        ></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: styles.surface.backgroundColor,
          borderColor: styles.border.borderColor
        }}
        className="flex items-center gap-2 p-2 rounded-lg hover:opacity-80 transition-all border"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = styles.surface.backgroundColor;
        }}
      >
        
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {getDisplayFirstName(user).charAt(0).toUpperCase()}
        </div>
        
        
        <span style={{
          color: user.isParent && familyManagementEnabled 
            ? 'var(--color-success)' 
            : styles.text.color
        }} className="font-medium transition-colors">
          {getDisplayFirstName(user)}
        </span>
        
        
        {user.isParent && (
          <div className={`w-2 h-2 rounded-full transition-colors ${
            familyManagementEnabled 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-gray-400'
          }`} 
          title={familyManagementEnabled ? 'Gerenciamento Ativo' : 'Gerenciamento Inativo'}
          />
        )}
        
        
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-text-secondary)' }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      
      {isOpen && (
                <div 
          style={{
            ...styles.surface,
            borderColor: styles.border.borderColor,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
          className="absolute right-0 mt-2 w-64 rounded-lg border shadow-lg z-50"
        >
          {/* Header do usuário */}
          <div 
            className="px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p 
              className="font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {getDisplayFirstName(user)}
            </p>
            {user.email && (
              <p 
                className="text-sm truncate"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {user.email}
              </p>
            )}
          </div>

          {/* Seção Perfil */}
          <div className="py-1">
            <button
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Meu Perfil
            </button>

            {/* Gerenciamento Familiar - só aparece se for parent */}
            {user.isParent && (
              <button
                onClick={handleToggleFamilyManagement}
                className="w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors"
                style={{ color: 'var(--color-text)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Gerenciamento Familiar
                </div>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
                  style={{
                    backgroundColor: familyManagementEnabled ? 'var(--color-success)' : 'var(--color-border)'
                  }}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    familyManagementEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </button>
            )}
          </div>

          <hr style={{ borderColor: 'var(--color-border)' }} />

          {/* Seção Navegação */}
          <div className="py-1">
            <button
              onClick={handleAccountsClick}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Contas
            </button>

            <button
              onClick={handleCategoriesClick}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categorias
            </button>

            <button
              onClick={handleTransactionsClick}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Transações
            </button>

            <button
              onClick={handleReportsClick}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h8a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Relatórios
            </button>

            <button
              onClick={handleExportClick}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Export
            </button>

            <button
              onClick={handleImportClick}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0-8l-4 4m4-4l4 4M4 4h16" />
              </svg>
            </button>
          </div>

          <hr style={{ borderColor: 'var(--color-border)' }} />

          {/* Seção Sair */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-error)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background)';
                e.currentTarget.style.color = 'var(--color-error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-error)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
