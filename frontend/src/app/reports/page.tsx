"use client";
import { useEffect, useState, useCallback } from 'react';
import { Transaction } from '@/lib/types/transaction';
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';
import { transactionsService } from '@/lib/services/transactionsService';
import { accountsService } from '@/lib/services/accountsService';
import { categoriesService } from '@/lib/services/categoriesService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TransactionFilters, StatusFilter, SortOrder } from '@/components/ui';
import IncomeChart from '@/components/reports/IncomeChart';
import ExpenseChart from '@/components/reports/ExpenseChart';
import PayableChart from '@/components/reports/PayableChart';
import PaidChart from '@/components/reports/PaidChart';
import MonthlyBalanceChart from '@/components/reports/MonthlyBalanceChart';
import CategoryDistributionChart from '@/components/reports/CategoryDistributionChart';
import UserComparisonChart from '@/components/reports/UserComparisonChart';
import UserExpenseDistributionChart from '@/components/reports/UserExpenseDistributionChart';
import CategoryTrendsChart from '@/components/reports/CategoryTrendsChart';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familyManagementEnabled, setFamilyManagementEnabled] = useState(false);
  
  // Estado do filtro - apenas status
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Função para verificar se o gerenciamento familiar está ativo
  const getFamilyManagementEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('familyManagementEnabled') === 'true';
  };

  // Função para aplicar todos os filtros
  const applyFilters = useCallback((data: Transaction[]) => {
    let filtered = [...data];

    // Filtro por usuário
    if (selectedUser !== 'all') {
      filtered = filtered.filter(t => t.username === selectedUser);
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      if (statusFilter === 'liquidated') {
        filtered = filtered.filter(t => t.effectiveDate);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(t => !t.effectiveDate);
      }
    }

    // Filtro por conta
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.accountId.toString() === selectedAccount);
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId && t.categoryId.toString() === selectedCategory);
    }

    // Filtro por data
    if (startDate) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.dueDate);
        return transactionDate >= new Date(startDate);
      });
    }

    if (endDate) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.dueDate);
        return transactionDate <= new Date(endDate);
      });
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTransactions(filtered);
    setTransactions(filtered);
  }, [selectedUser, statusFilter, selectedAccount, selectedCategory, startDate, endDate, sortBy, sortOrder]);

  // Funções para lidar com mudanças nos filtros
  const handleUserFilterChange = (user: string) => {
    setSelectedUser(user);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
  };

  const handleAccountFilterChange = (accountId: string) => {
    setSelectedAccount(accountId);
  };

  const handleCategoryFilterChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Aplicar filtros sempre que algum filtro mudar
  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFilters(allTransactions);
    }
  }, [allTransactions, applyFilters]);

  const loadTransactions = useCallback(async (isParentMode?: boolean) => {
    try {
      setLoading(true);
      const [transactionsData, accountsData, categoriesData] = await Promise.all([
        transactionsService.getAll(isParentMode),
        accountsService.getAll(isParentMode),
        categoriesService.getAll(isParentMode)
      ]);
      
      setAllTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
      
      // Extrair usuários únicos das transações
      const users = Array.from(new Set(transactionsData.map(t => t.username).filter(Boolean))) as string[];
      const sortedUsers = users.toSorted((a, b) => a.localeCompare(b));
      setAvailableUsers(sortedUsers);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Verificar estado inicial do gerenciamento familiar
    setFamilyManagementEnabled(getFamilyManagementEnabled());
    
    // Escutar mudanças no gerenciamento familiar
    const handleFamilyManagementChange = () => {
      const isEnabled = getFamilyManagementEnabled();
      setFamilyManagementEnabled(isEnabled);
      // Recarregar dados quando o estado muda
      loadTransactions(isEnabled);
    };

    window.addEventListener('storage', handleFamilyManagementChange);
    window.addEventListener('familyManagementChanged', handleFamilyManagementChange);
    
    // Carregar dados iniciais
    loadTransactions(getFamilyManagementEnabled());

    return () => {
      window.removeEventListener('storage', handleFamilyManagementChange);
      window.removeEventListener('familyManagementChanged', handleFamilyManagementChange);
    };
  }, [loadTransactions]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen pt-20 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen pt-20 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="container mx-auto max-w-6xl">
            <div 
              className="p-4 rounded-lg border text-center"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-error)',
                color: 'var(--color-error)'
              }}
            >
              {error}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-20 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 
                className="text-3xl font-bold"
                style={{ color: 'var(--color-text)' }}
              >
                Relatórios Financeiros
              </h1>
              
              {/* Indicador de Modo Familiar */}
              {familyManagementEnabled && (
                <div 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--color-success-bg, rgba(34, 197, 94, 0.1))',
                    borderColor: 'var(--color-success)',
                    color: 'var(--color-success)'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium">
                    Modo Familiar Ativo
                  </span>
                </div>
              )}
            </div>
            
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {familyManagementEnabled 
                ? 'Visualize os dados financeiros da família através de gráficos interativos'
                : 'Visualize seus dados financeiros através de gráficos interativos'
              }
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <TransactionFilters
              config={{
                user: availableUsers.length > 0 ? {
                  enabled: true,
                  selectedUser,
                  availableUsers,
                  onUserChange: handleUserFilterChange
                } : undefined,
                status: {
                  enabled: true,
                  selectedStatus: statusFilter,
                  onStatusChange: handleStatusFilterChange
                },
                account: accounts.length > 0 ? {
                  enabled: true,
                  selectedAccount,
                  availableAccounts: accounts,
                  onAccountChange: handleAccountFilterChange
                } : undefined,
                category: categories.length > 0 ? {
                  enabled: true,
                  selectedCategory,
                  availableCategories: categories,
                  onCategoryChange: handleCategoryFilterChange
                } : undefined,
                dateRange: {
                  enabled: true,
                  startDate,
                  endDate,
                  onDateRangeChange: handleDateRangeChange
                },
                sort: {
                  enabled: true,
                  sortBy,
                  sortOrder,
                  sortOptions: [
                    { value: 'dueDate', label: 'Data de Vencimento' },
                    { value: 'amount', label: 'Valor' },
                    { value: 'description', label: 'Descrição' }
                  ],
                  onSortChange: handleSortChange
                }
              }}
              familyManagementEnabled={familyManagementEnabled}
            />
            
            {/* Contador de transações */}
            <div className="mt-4 flex justify-end">
              <div 
                className="text-sm px-3 py-2 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)' 
                }}
              >
                Exibindo {transactions.length} de {allTransactions.length} transações
              </div>
            </div>
          </div>

          {/* Grid de Gráficos */}
          <div className={`grid gap-6 mb-8 ${familyManagementEnabled ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Gráfico de Entradas */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Entradas por Mês
              </h2>
              <IncomeChart transactions={transactions} />
            </div>

            {/* Gráfico de Saídas */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Saídas por Mês
              </h2>
              <ExpenseChart transactions={transactions} />
            </div>

            {/* Gráfico de Distribuição de Gastos por Usuário - só no modo familiar */}
            {familyManagementEnabled && (
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h2 
                  className="text-xl font-semibold mb-4"
                  style={{ color: 'var(--color-text)' }}
                >
                  Distribuição de Gastos por Usuário
                </h2>
                <UserExpenseDistributionChart transactions={transactions} />
              </div>
            )}
          </div>

          {/* Segunda linha de gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Contas a Pagar */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Contas a Pagar
              </h2>
              <PayableChart transactions={transactions} />
            </div>

            {/* Gráfico de Contas Pagas por Mês */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Contas Pagas por Mês
              </h2>
              <PaidChart transactions={transactions} />
            </div>
          </div>

          {/* Gráficos de largura completa */}
          <div className="grid grid-cols-1 gap-6">
            {/* Gráfico de Comparação de Usuários - só aparece no modo familiar */}
            {familyManagementEnabled && (
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h2 
                  className="text-xl font-semibold mb-4"
                  style={{ color: 'var(--color-text)' }}
                >
                  Comparação de Movimentação por Usuário
                </h2>
                <UserComparisonChart transactions={transactions} />
              </div>
            )}

            {/* Gráfico de Balanço Mensal */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Balanço Mensal (Entradas vs Saídas)
              </h2>
              <MonthlyBalanceChart transactions={transactions} />
            </div>

            {/* Gráfico de Distribuição por Categoria */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Distribuição de Gastos por Categoria
              </h2>
              <CategoryDistributionChart transactions={transactions} />
            </div>

            {/* Gráfico de Tendências por Categoria */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Tendências de Gastos por Categoria (Top 5)
              </h2>
              <CategoryTrendsChart transactions={transactions} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
