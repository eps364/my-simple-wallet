"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Account } from '@/lib/types/account';
import { accountsService } from '@/lib/services/accountsService';
import AccountModal from '@/components/forms/AccountModal';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';
import { useAuth } from '@/context/AuthContext';
import { usersService } from '@/lib/services/usersService';

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete';
    account?: Account;
  }>({
    isOpen: false,
    mode: 'create'
  });
  const styles = useThemeStyles();

  const getFamilyManagementEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('familyManagementEnabled');
    return stored === 'true';
  };

  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const user = await usersService.getProfile();
      const shouldUseParentMode = getFamilyManagementEnabled();
      const accountsData = await accountsService.getAll(shouldUseParentMode);
      const myAccounts = accountsData.filter(acc => String(acc.userId) === user.id);
      setAccounts(myAccounts);
    } catch {
      setError('Erro ao carregar contas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const handleStorageChange = () => {
      loadAccounts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('familyManagementChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('familyManagementChanged', handleStorageChange);
    };
  }, [loadAccounts]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setModalState({
        isOpen: true,
        mode: 'create'
      });
    }
  }, [searchParams]);

  const openModal = (mode: 'create' | 'edit' | 'delete', account?: Account) => {
    setModalState({
      isOpen: true,
      mode,
      account
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create'
    });
  };

  const handleModalSuccess = () => {
    closeModal();
    loadAccounts();
  };

  const getAccountColor = (id: number): string => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200', 
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    return colors[id % colors.length];
  };

  if (isLoading) {
    return (
      <div 
        className="container mx-auto px-4 py-8"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <svg 
              className="animate-spin h-12 w-12" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--color-primary)' }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Carregando contas...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="container mx-auto px-4 py-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 
            className="text-3xl font-bold"
            style={{ color: 'var(--color-text)' }}
          >
            Gerenciar Contas
          </h1>
          <p 
            className="mt-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Visualize e gerencie todas as suas contas bancárias e cartões
          </p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="px-6 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
        >
          + Adicionar Nova Conta
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button
            onClick={loadAccounts}
            className="ml-4 text-red-800 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg 
              style={{ color: styles.textMuted.color }} 
              className="mx-auto h-24 w-24" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 style={{ color: styles.text.color }} className="mt-4 text-lg font-medium">
              Nenhuma conta encontrada
            </h3>
            <p style={{ color: styles.textSecondary.color }} className="mt-2">
              Comece adicionando sua primeira conta bancária ou cartão de crédito.
            </p>
            <button
              onClick={() => openModal('create')}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
              className="mt-6 px-6 py-3 font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              Adicionar Primeira Conta
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              style={{
                ...styles.surface,
                borderColor: styles.border.borderColor,
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              className="rounded-lg p-6 hover:shadow-md transition-all border"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
              }}
            >
              {/* Account Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getAccountColor(account.id)}`}>
                    #{account.id}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal('edit', account)}
                    style={{
                      color: 'var(--color-primary)',
                      backgroundColor: 'transparent'
                    }}
                    className="p-2 rounded-lg transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.opacity = '1';
                    }}
                    title="Editar conta"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openModal('delete', account)}
                    style={{
                      color: 'var(--color-error)',
                      backgroundColor: 'transparent'
                    }}
                    className="p-2 rounded-lg transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-error)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-error)';
                      e.currentTarget.style.opacity = '1';
                    }}
                    title="Excluir conta"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 style={{ color: styles.text.color }} className="text-lg font-semibold truncate">
                  {account.description}
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span style={{ color: styles.textSecondary.color }} className="text-sm">Saldo:</span>
                    <span className={`text-sm font-medium ${
                      account.balance >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}
                    style={{
                      color: account.balance >= 0 
                        ? 'var(--color-success)' 
                        : 'var(--color-error)'
                    }}
                    >
                      R$ {account.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  {account.credit !== undefined && account.credit !== null && (
                    <div className="flex justify-between items-center">
                      <span style={{ color: styles.textSecondary.color }} className="text-sm">Limite:</span>
                      <span 
                        style={{ color: 'var(--color-primary)' }} 
                        className="text-sm font-medium"
                      >
                        R$ {account.credit.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {account.dueDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Vencimento:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Dia {account.dueDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AccountModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        account={modalState.account}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
