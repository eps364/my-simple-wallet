"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/lib/services/usersService';
import { clearAuthData } from '@/lib/apiService';
import { User } from '@/lib/types/user';

interface UserMenuProps {
  readonly onLogout?: () => void;
}

// Função para acessar diretamente o localStorage
const getFamilyManagementEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('familyManagementEnabled') === 'true';
};

// Função para alterar o estado no localStorage
const setFamilyManagementEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('familyManagementEnabled', enabled.toString());
  // Disparar evento customizado para notificar outras abas/componentes
  window.dispatchEvent(new CustomEvent('familyManagementChanged'));
};

export default function UserMenu({ onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyManagementEnabled, setFamilyManagementEnabledState] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadUserProfile = useCallback(async () => {
    try {
      const userData = await usersService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      clearAuthData();
      if (onLogout) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    loadUserProfile();
    
    // Sincronizar com localStorage na inicialização
    setFamilyManagementEnabledState(getFamilyManagementEnabled());
    
    // Listener para mudanças no localStorage
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

  // Fechar menu ao clicar fora
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

  const handleToggleFamilyManagement = () => {
    const newValue = !familyManagementEnabled;
    setFamilyManagementEnabled(newValue);
    setFamilyManagementEnabledState(newValue);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
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
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        {/* Avatar inicial */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        {/* Username */}
        <span className={`font-medium transition-colors ${
          user.isParent && familyManagementEnabled 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {user.username}
        </span>
        
        {/* Indicador de gerenciamento para Parents */}
        {user.isParent && (
          <div className={`w-2 h-2 rounded-full transition-colors ${
            familyManagementEnabled 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-gray-400'
          }`} 
          title={familyManagementEnabled ? 'Gerenciamento Ativo' : 'Gerenciamento Inativo'}
          />
        )}
        
        {/* Ícone dropdown */}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 py-1 z-50">
          {/* Informações do usuário */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-600">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.username}
            </p>
            {user.email && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            )}
          </div>

          {/* Opções do menu */}
          <button
            onClick={handleProfileClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Meu Perfil
          </button>

          {/* Toggle de Gerenciamento Familiar - apenas para Parents */}
          {user.isParent && (
            <button
              onClick={handleToggleFamilyManagement}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Gerenciamento Familiar
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                familyManagementEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  familyManagementEnabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
            </button>
          )}

          <hr className="border-gray-200 dark:border-slate-600" />

          {/* Navegação rápida */}
          <button
            onClick={handleAccountsClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Contas
          </button>

          <button
            onClick={handleCategoriesClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categorias
          </button>

          <button
            onClick={handleTransactionsClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Transações
          </button>

          <hr className="border-gray-200 dark:border-slate-600" />

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
