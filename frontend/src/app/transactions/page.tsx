"use client";

import LoanModal from '@/components/forms/LoanModal';
import TransactionModal from '@/components/forms/TransactionModal';
import { StatusFilter, SortOrder } from '@/components/ui';
import AdvancedTransactionFilters from '@/components/ui/AdvancedTransactionFilters';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';
import { accountsService } from '@/lib/services/accountsService';
import { categoriesService } from '@/lib/services/categoriesService';
import { transactionsService } from '@/lib/services/transactionsService';
import { usersService } from '@/lib/services/usersService';
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';
import { Transaction, TransactionType } from '@/lib/types/transaction';
import { User } from '@/lib/types/user';
import { useCallback, useEffect, useState } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [familyManagementEnabled, setFamilyManagementEnabled] = useState<boolean>(false);

  // Estados dos filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
  const [dateField, setDateField] = useState<string>('dueDate');
  const [descriptionFilter, setDescriptionFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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
    // Helper para normalizar datas para YYYYMMDD
    const normalizeDate = (d: string) => {
      if (!d) return '';
      // Se já está no formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.replace(/-/g, '').substring(0, 8);
      // Se está no formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}/.test(d)) {
        const [day, month, year] = d.split('/');
        return `${year}${month}${day}`;
      }
      // Tenta converter para Date
      try {
        const dateObj = new Date(d);
        if (!isNaN(dateObj.getTime())) {
          const y = dateObj.getFullYear();
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          return `${y}${m}${day}`;
        }
      } catch (e) {}
      return '';
    };

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
  const handleStatusFilterChange = (status: StatusFilter) => setStatusFilter(status);
  const handleAccountChange = (accountId: string) => setAccountFilter(accountId);
  const handleCategoryChange = (categoryId: string) => setCategoryFilter(categoryId);
  const handleTypeChange = (type: string) => setTypeFilter(type);
  const handleUserChange = (username: string) => setUserFilter(username);
  const handleDateRangeChange = (start: string, end: string) => setDateRange({ startDate: start, endDate: end });
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setDescriptionFilter(e.target.value);
  const handleSortChange = (field: string, order: SortOrder) => { setSortBy(field); setSortOrder(order); };

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

      const [transactionsData, accountsData, categoriesData, userData, usersData] = await Promise.all([
        transactionsService.getAll(shouldUseParentMode),
        accountsService.getAll(shouldUseParentMode),
        categoriesService.getAll(shouldUseParentMode),
        usersService.getProfile(), // usuário logado
        shouldUseParentMode ? usersService.getChildren() : Promise.resolve([]) // filhos
      ]);

      setAllTransactions(transactionsData);
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
  }, []);

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

  // Carregar dados inicialmente
  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';

    // Se a data já está no formato DD/MM/YYYY (do backend), apenas retorna
    if (dateString.includes('/')) {
      return dateString;
    }

    // Se está no formato ISO (YYYY-MM-DD), converte para DD/MM/YYYY
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

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
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          dateField={dateField}
          onDateFieldChange={setDateField}
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
        <div className="mt-4 flex justify-end">
          <div
            style={{ color: styles.textMuted.color }}
            className="text-sm"
          >
            <span>
              Mostrando {transactions.length} de {allTransactions.length} transações
            </span>
          </div>
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
            <div
              key={transaction.id}
              style={{
                ...styles.surface,
                borderColor: styles.border.borderColor,
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}
              className="rounded-lg border p-6 transition-all hover:shadow-md"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3
                    style={{ color: styles.text.color }}
                    className="text-lg font-semibold truncate"
                  >
                    {transaction.description}
                  </h3>
                  <p
                    style={{ color: styles.textSecondary.color }}
                    className="text-sm mt-1"
                  >
                    {getAccountName(transaction.accountId)}
                  </p>
                </div>
                {/* <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTransactionTypeColor(transaction.type)}`}>
                  {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                </span> */}
              </div>

              {/* Card Content - Flex Grow */}
              <div className="flex-grow">
                {/* Main Amount (always show both, Valor then Valor Efetivo if exists) */}
                <div className="mb-4">
                  {/* Valor Efetivo em destaque, se existir */}
                  {transaction.effectiveAmount !== undefined && transaction.effectiveAmount !== null ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span
                          style={{ color: styles.textSecondary.color }}
                          className="text-sm"
                        >
                          Valor Efetivo
                        </span>
                        <span className={`text-2xl font-extrabold ${transaction.type === TransactionType.INCOME
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                          }`}>
                          {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.effectiveAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 opacity-60">
                        <span
                          style={{ color: styles.textSecondary.color }}
                          className="text-xs"
                        >
                          Valor original
                        </span>
                        <span className={`text-base font-medium ${transaction.type === TransactionType.INCOME
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                          }`}>
                          {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span
                        style={{ color: styles.textSecondary.color }}
                        className="text-sm"
                      >
                        Valor
                      </span>
                      <span className={`text-2xl font-bold ${transaction.type === TransactionType.INCOME
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                        }`}>
                        {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span
                      style={{ color: styles.textSecondary.color }}
                      className="text-sm"
                    >
                      Categoria
                    </span>
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white'
                      }}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium opacity-90"
                    >
                      {getCategoryName(transaction.categoryId)}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span
                      style={{ color: styles.textSecondary.color }}
                      className="text-sm"
                    >
                      Vencimento
                    </span>
                    <span
                      style={{ color: styles.text.color }}
                      className="text-sm font-medium"
                    >
                      {formatDate(transaction.dueDate)}
                    </span>
                  </div>
                  {transaction.effectiveDate && (
                    <div className="flex items-center justify-between">
                      <span
                        style={{ color: styles.textSecondary.color }}
                        className="text-sm"
                      >
                        Data Efetiva
                      </span>
                      <span
                        style={{ color: styles.textMuted.color }}
                        className="text-sm"
                      >
                        {formatDate(transaction.effectiveDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Valor Efetivo removido do card separado, agora sempre aparece abaixo de Valor se existir */}

                {/* Status Badge */}
                <div className="mb-4">
                  {transaction.effectiveDate ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Liquidada
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Pendente
                    </span>
                  )}
                </div>
              </div>

              {/* Footer - Fixed at Bottom */}
              <div
                style={{ borderColor: styles.border.borderColor }}
                className="flex justify-between items-center pt-4 border-t gap-3 mt-auto"
              >
                {/* Username (lado esquerdo) */}
                <div className="flex items-center min-w-0 flex-1">
                  {familyManagementEnabled && currentUser?.isParent && transaction.username && (
                    <span
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-md flex items-center transition-all shadow-sm"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                        e.currentTarget.style.color = 'var(--color-text)';
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {transaction.username}
                    </span>
                  )}
                </div>

                {/* Botões de ação (lado direito) */}
                <div className="flex space-x-1 flex-shrink-0">
                  {canEditTransaction(transaction) ? (
                    <>
                      <button
                        onClick={() => openModal('edit', transaction)}
                        style={{
                          color: 'var(--color-primary)',
                          backgroundColor: 'transparent'
                        }}
                        className="px-2 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center min-w-[36px]"
                        title="Editar transação"
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
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {!transaction.effectiveDate && (
                        <button
                          onClick={() => openModal('settle', transaction)}
                          style={{
                            color: 'var(--color-success)',
                            backgroundColor: 'transparent'
                          }}
                          className="px-2 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center min-w-[36px]"
                          title="Liquidar transação"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-success)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-success)';
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => openModal('delete', transaction)}
                        style={{
                          color: 'var(--color-error)',
                          backgroundColor: 'transparent'
                        }}
                        className="px-2 py-2 text-sm font-medium rounded-lg transition-all min-w-[36px] flex items-center justify-center"
                        title="Excluir transação"
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
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div
                      style={{
                        ...styles.background,
                        borderColor: styles.border.borderColor,
                        color: styles.textMuted.color
                      }}
                      className="px-3 py-2 text-xs text-center rounded-lg border flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="whitespace-nowrap">Apenas Visualização</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
