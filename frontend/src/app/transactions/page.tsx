"use client";

import LoanModal from '@/components/forms/LoanModal';
import TransactionModal from '@/components/forms/TransactionModal';
import { SortOrder, StatusFilter } from '@/components/ui';
import AdvancedTransactionFilters from '@/components/ui/AdvancedTransactionFilters';
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
import { normalizeDate } from '@/lib/utils/dateUtils';
import { useCallback, useEffect, useState } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
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

  type MultiStatusFilter = StatusFilter | StatusFilter[];
  
  const [statusFilter, setStatusFilter] = useState<MultiStatusFilter>(['pending', 'overdue']);
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
  const [dateField, setDateField] = useState<string>('dueDate');
  const [descriptionFilter, setDescriptionFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Função para buscar estado do gerenciamento familiar do localStorage
  const getFamilyManagementEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('familyManagementEnabled');
    return stored === 'true';
  };

  // Função para obter o nome da categoria
  const getCategoryName = useCallback((categoryId?: number): string => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.category || 'Categoria não encontrada';
  }, [categories]);

  // Função para aplicar todos os filtros e ordenação
  const applyFilters = useCallback((data: Transaction[]) => {
    let filtered = [...data];

    // Filtro por status
    if (statusFilter !== 'all') {
      if (statusFilter === 'liquidated') {
        filtered = filtered.filter(t => t.effectiveDate);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(t => !t.effectiveDate);
      }
    }

    // Filtro por conta
    if (accountFilter !== 'all') {
      filtered = filtered.filter(t => t.accountId === Number(accountFilter));
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.categoryId === Number(categoryFilter));
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => String(t.type) === typeFilter);
    }

    // Filtro por usuário (apenas se familyManagementEnabled)
    if (familyManagementEnabled && userFilter !== 'all') {
      filtered = filtered.filter(t => t.username === userFilter);
    }

    // Filtro por período
    if (dateRange.startDate) {
      const startNorm = normalizeDate(dateRange.startDate);
      filtered = filtered.filter(t => {
        const value = t[dateField as keyof Transaction];
        if (!value) return false;
        const dateNorm = normalizeDate(typeof value === 'string' ? value.substring(0, 10) : '');
        return dateNorm >= startNorm;
      });
    }
    if (dateRange.endDate) {
      const endNorm = normalizeDate(dateRange.endDate);
      filtered = filtered.filter(t => {
        const value = t[dateField as keyof Transaction];
        if (!value) return false;
        const dateNorm = normalizeDate(typeof value === 'string' ? value.substring(0, 10) : '');
        return dateNorm <= endNorm;
      });
    }

    // Filtro por descrição
    if (descriptionFilter.trim() !== '') {
      filtered = filtered.filter(t => t.description.toLowerCase().includes(descriptionFilter.trim().toLowerCase()));
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: unknown = a[sortBy as keyof Transaction];
      let bValue: unknown = b[sortBy as keyof Transaction];
      // Se for data, converter para Date
      if (sortBy === 'dueDate' || sortBy === 'effectiveDate') {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return 0;
    });

    setTransactions(filtered);
  }, [statusFilter, accountFilter, categoryFilter, typeFilter, userFilter, familyManagementEnabled, dateRange, descriptionFilter, sortBy, sortOrder, dateField]);

  // Handlers dos filtros
  const handleStatusFilterChange = useCallback((status: MultiStatusFilter) => setStatusFilter(status), []);
  const handleAccountChange = useCallback((accountId: string) => setAccountFilter(accountId), []);
  const handleCategoryChange = useCallback((categoryId: string) => setCategoryFilter(categoryId), []);
  const handleTypeChange = useCallback((type: string) => setTypeFilter(type), []);
  const handleUserChange = useCallback((username: string) => setUserFilter(username), []);
  const handleDescriptionChange = useCallback((value: string) => setDescriptionFilter(value), []);
  const handleSortChange = useCallback((field: string, order: SortOrder) => { setSortBy(field); setSortOrder(order); }, []);

  // Aplicar filtros sempre que algum filtro mudar
  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFilters(allTransactions);
    }
  }, [allTransactions, applyFilters]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Enviar isParent=true quando o gerenciamento familiar estiver ativo
      const shouldUseParentMode = getFamilyManagementEnabled();

      // Montar filtros para backend
      const filters: Record<string, unknown> = {};
      if (accountFilter !== 'all') filters.accountId = Number(accountFilter);
      if (categoryFilter !== 'all') filters.categoryId = Number(categoryFilter);
      if (typeFilter !== 'all') filters.type = Number(typeFilter);
      if (dateRange.startDate) filters.dateFrom = dateRange.startDate;
      if (dateRange.endDate) filters.dateTo = dateRange.endDate;
      if (descriptionFilter.trim() !== '') filters.description = descriptionFilter.trim();
      if (familyManagementEnabled && userFilter !== 'all') filters.username = userFilter;
      if (sortBy) filters.sort = sortBy;
      if (sortOrder) filters.order = sortOrder;
      // Adiciona filtro de status para o backend
      if (statusFilter !== 'all') filters.status = statusFilter;

      const [transactionsData, accountsData, categoriesData, userData, usersData] = await Promise.all([
        transactionsService.getFiltered(filters, page, pageSize, shouldUseParentMode),
        accountsService.getAll(shouldUseParentMode),
        categoriesService.getAll(shouldUseParentMode),
        usersService.getProfile(), // usuário logado
        shouldUseParentMode ? usersService.getChildren() : Promise.resolve([]) // filhos
      ]);

      setPagination(transactionsData);
      setAllTransactions(transactionsData.content);
      setTransactions(transactionsData.content);
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
  }, [page, pageSize, accountFilter, categoryFilter, typeFilter, dateRange, descriptionFilter, familyManagementEnabled, sortBy, sortOrder, userFilter, statusFilter]);

  useEffect(() => {
    // Sincronizar com localStorage na inicialização
    setFamilyManagementEnabled(getFamilyManagementEnabled());

    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      const newValue = getFamilyManagementEnabled();
      setFamilyManagementEnabled(newValue);
      // Recarregar dados quando o estado mudar
      if (currentUser) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listener customizado para mudanças feitas na mesma aba
    window.addEventListener('familyManagementChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('familyManagementChanged', handleStorageChange);
    };
  }, [currentUser, loadData]);

  // Carregar dados inicialmente e ao mudar página
  useEffect(() => {
    loadData();
  }, [loadData, page, pageSize]);

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
    loadData(); // Recarregar a lista após operação bem-sucedida
  };

  // Função para obter nome da conta
  const getAccountName = (accountId: number): string => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.description || 'Conta não encontrada';
  };

  // Verificar se uma transação pode ser editada/deletada (apenas transações do usuário logado)
  const canEditTransaction = (transaction: Transaction): boolean => {
    return currentUser ? transaction.username === currentUser.username : false;
  };

  // Usar utilitário centralizado para datas
  

  const getEmptyStateTexts = () => {
    if (allTransactions.length === 0) {
      return {
        title: 'Nenhuma transação encontrada',
        description: 'Comece adicionando sua primeira receita ou despesa.',
        showButton: true
      };
    }

    return {
      title: 'Nenhuma transação encontrada com os filtros aplicados',
      description: 'Tente ajustar os filtros para ver mais transações.',
      showButton: false
    };
  };

  // Helper: check if any transaction has the selected date field
  const anyHasDateField = allTransactions.some(t => !!t[dateField as keyof Transaction]);

  if (isLoading) {
    return (
      <div
        style={{ backgroundColor: styles.background.backgroundColor }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <svg
              style={{ color: 'var(--color-primary)' }}
              className="animate-spin h-12 w-12"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p
              style={{ color: styles.textSecondary.color }}
            >
              Carregando transações...
            </p>
          </div>
        </div>
      </div>
    );
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
        <AdvancedTransactionFilters
          statusFilter={statusFilter}
          onStatusChange={handleStatusFilterChange}
          accountFilter={accountFilter}
          onAccountChange={handleAccountChange}
          accounts={accounts}
          categoryFilter={categoryFilter}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          typeFilter={typeFilter}
          onTypeChange={handleTypeChange}
          descriptionFilter={descriptionFilter}
          onDescriptionChange={handleDescriptionChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          className="mb-2"
          onClearFilters={() => {
            setStatusFilter('all');
            setAccountFilter('all');
            setCategoryFilter('all');
            setTypeFilter('all');
            setUserFilter('all');
            setDateRange({ startDate: '', endDate: '' });
            setDateField('dueDate');
            setDescriptionFilter('');
            setSortBy('dueDate');
            setSortOrder('desc');
          }}
          users={familyManagementEnabled && currentUser ? [
            currentUser,
            ...Array.isArray(users) ? users : []
          ] : []}
          userFilter={userFilter}
          onUserChange={handleUserChange}
        />
        {/* Results Counter */}
        <div className="mt-4 flex flex-col md:flex-row justify-end items-center gap-4">
          <div
            style={{ color: styles.textMuted.color }}
            className="text-sm"
          >
            <span>
              Mostrando {transactions.length} de {pagination?.totalElements ?? allTransactions.length} transações
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
      {transactions.length === 0 ? (
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
            {/* Helper: if filtering by a date field that is missing in all transactions, show a tip */}
            {dateRange.startDate && !anyHasDateField && (
              <div className="mt-4 text-sm text-yellow-700 bg-yellow-100 rounded p-3 border border-yellow-300">
                Nenhuma transação possui o campo de data selecionado (<b>{dateField}</b>).<br />
                Tente escolher outro campo de data ou limpe o filtro de período.
              </div>
            )}
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
