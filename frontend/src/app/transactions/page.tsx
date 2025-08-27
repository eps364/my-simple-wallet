"use client";

import LoanModal from '@/components/forms/LoanModal';
import TransactionModal from '@/components/forms/TransactionModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MonthNavigator from '@/components/ui/MonthNavigator';
import TransactionCard from '@/components/ui/TransactionCard';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';
import { accountsService } from '@/lib/services/accountsService';
import { categoriesService } from '@/lib/services/categoriesService';
import { transactionsService } from '@/lib/services/transactionsService';
import { usersService } from '@/lib/services/usersService';
import { Account } from '@/lib/types/account';
import { PaginatedResponse } from '@/lib/types/api';
import { Category } from '@/lib/types/category';
import { Transaction } from '@/lib/types/transaction';
import { User } from '@/lib/types/user';
import { useCallback, useEffect, useState } from 'react';

export default function TransactionsPage() {
  const [pagination, setPagination] = useState<PaginatedResponse<Transaction> | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [familyManagementEnabled, setFamilyManagementEnabled] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const styles = useThemeStyles();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete' | 'settle';
    transaction?: Transaction;
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [loanModalOpen, setLoanModalOpen] = useState(false);

  const getFamilyManagementEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('familyManagementEnabled');
    return stored === 'true';
  };

  const getCategoryName = useCallback((categoryId?: number): string => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.category || 'Categoria não encontrada';
  }, [categories]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const shouldUseParentMode = getFamilyManagementEnabled();

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const filters: Record<string, unknown> = {
        dateFrom: startDate,
        dateTo: endDate,
        // TODO: The user wants to filter by settlement date, pre-dated date, and overdue date.
        // This is not directly supported by the backend.
        // For now, we are filtering by a date range on the default date field.
        // This might need to be adjusted depending on the backend implementation.
        sort: 'dueDate',
        order: 'asc'
      };

      const [transactionsData, accountsData, categoriesData, userData, usersData] = await Promise.all([
        transactionsService.getFiltered(filters, page, pageSize, shouldUseParentMode),
        accountsService.getAll(shouldUseParentMode),
        categoriesService.getAll(shouldUseParentMode),
        usersService.getProfile(),
        shouldUseParentMode ? usersService.getChildren() : Promise.resolve([])
      ]);

      setPagination(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setCurrentUser(userData);
      if (shouldUseParentMode) setUsers(usersData);
      else setUsers([]);
    } catch {
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, currentDate, familyManagementEnabled]);

  useEffect(() => {
    setFamilyManagementEnabled(getFamilyManagementEnabled());

    const handleStorageChange = () => {
      const newValue = getFamilyManagementEnabled();
      setFamilyManagementEnabled(newValue);
      if (currentUser) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('familyManagementChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('familyManagementChanged', handleStorageChange);
    };
  }, [currentUser, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData, page, pageSize, currentDate]);

  const openModal = (mode: 'create' | 'edit' | 'delete' | 'settle', transaction?: Transaction) => {
    setModalState({
      isOpen: true,
      mode,
      transaction
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
    loadData();
  };

  const getAccountName = (accountId: number): string => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.description || 'Conta não encontrada';
  };

  const canEditTransaction = (transaction: Transaction): boolean => {
    return currentUser ? transaction.username === currentUser.username : false;
  };

  const getEmptyStateTexts = () => {
    if (pagination?.totalElements === 0) {
      return {
        title: 'Nenhuma transação encontrada',
        description: 'Comece adicionando sua primeira receita ou despesa.',
        showButton: true
      };
    }

    return {
      title: 'Nenhuma transação encontrada para este mês',
      description: 'Tente navegar para um mês diferente ou adicione uma nova transação.',
      showButton: false
    };
  };

  const transactions = pagination?.content ?? [];

  if (isLoading) {
    return <LoadingSpinner label="Carregando transações..." />;
  }

  return (
    <div
      style={{ backgroundColor: styles.background.backgroundColor }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            style={{ color: styles.text.color }}
            className="text-3xl font-bold"
          >
            Gerenciar Transações
          </h1>
          <p
            style={{ color: styles.textSecondary.color }}
            className="mt-2"
          >
            Visualize e gerencie todas as suas receitas e despesas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('create')}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
            className="px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            + Transação
          </button>
          <button
            onClick={() => setLoanModalOpen(true)}
            style={{
              backgroundColor: 'var(--color-success)',
              color: 'white'
            }}
            className="px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            + Empréstimo
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <MonthNavigator
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          className="mb-2"
        />
        {/* Results Counter */}
        <div className="mt-4 flex flex-col md:flex-row justify-end items-center gap-4">
          <div
            style={{ color: styles.textMuted.color }}
            className="text-sm"
          >
            <span>
              Mostrando {transactions.length} de {pagination?.totalElements ?? 0} transações
            </span>
          </div>
          {/* Paginação avançada */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex gap-2 items-center">
              <button
                disabled={page === 0}
                onClick={() => setPage(0)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                « Primeira
              </button>
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                ‹ Anterior
              </button>
              <span>Página {page + 1} de {pagination.totalPages}</span>
              <button
                disabled={page === pagination.totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Próxima ›
              </button>
              <button
                disabled={page === pagination.totalPages - 1}
                onClick={() => setPage(pagination.totalPages - 1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Última »
              </button>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="ml-2 px-2 py-1 border rounded"
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size} por página</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--color-error)',
            borderColor: 'var(--color-error)',
            color: 'white',
            opacity: 0.9
          }}
          className="mb-6 p-4 border rounded-lg"
        >
          {error}
          <button
            onClick={loadData}
            style={{ color: 'white' }}
            className="ml-4 underline hover:no-underline transition-all"
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Transactions List */}
      {transactions.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg
              style={{ color: styles.textMuted.color }}
              className="mx-auto h-24 w-24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3
              style={{ color: styles.text.color }}
              className="mt-4 text-lg font-medium"
            >
              {getEmptyStateTexts().title}
            </h3>
            <p
              style={{ color: styles.textSecondary.color }}
              className="mt-2"
            >
              {getEmptyStateTexts().description}
            </p>
            {getEmptyStateTexts().showButton && (
              <button
                onClick={() => openModal('create')}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
                className="mt-6 px-6 py-3 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Adicionar Primeira Transação
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {transactions.map((transaction: Transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              currentUser={currentUser}
              familyManagementEnabled={familyManagementEnabled}
              getAccountName={getAccountName}
              getCategoryName={getCategoryName}
              canEditTransaction={canEditTransaction}
              onEdit={() => openModal('edit', transaction)}
              onDelete={() => openModal('delete', transaction)}
              onSettle={() => openModal('settle', transaction)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <TransactionModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        transaction={modalState.transaction}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de Empréstimo */}
      <LoanModal
        isOpen={loanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        onSuccess={handleModalSuccess}
        accounts={accounts.filter(acc => acc.userId === currentUser?.id)}
        categories={categories.filter(cat => cat.userId === currentUser?.id)}
      />
    </div>
  );
}
