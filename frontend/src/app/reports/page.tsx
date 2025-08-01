"use client";
import { useEffect, useState, useCallback } from 'react';
import { Transaction } from '@/lib/types/transaction';
// ...existing code...
import { transactionsService } from '@/lib/services/transactionsService';
// ...existing code...
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StatusFilter, SortOrder } from '@/components/ui';
import AdvancedTransactionFilters from '@/components/ui/AdvancedTransactionFilters';
import { accountsService } from '@/lib/services/accountsService';
import { categoriesService } from '@/lib/services/categoriesService';
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';
import { User } from '@/lib/types/user';
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
  // ...existing code...
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familyManagementEnabled, setFamilyManagementEnabled] = useState(false);
  
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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users] = useState<User[]>([]);

  // Função para verificar se o gerenciamento familiar está ativo
  const getFamilyManagementEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('familyManagementEnabled') === 'true';
  };

  // Função para aplicar todos os filtros e ordenação
  const applyFilters = useCallback((data: Transaction[]) => {
    let filtered = [...data];

    // Filtro por status
    if (statusFilter !== 'all') {
      if (statusFilter === 'liquidated') {
        filtered = filtered.filter(t => t.effectiveDate);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(t => !t.effectiveDate);
      } else if (statusFilter === 'overdue') {
        
        const today = new Date();
        const normalizeDate = (d: string) => {
          if (!d) return '';
          if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.replace(/-/g, '').substring(0, 8);
          if (/^\d{2}\/\d{2}\/\d{4}/.test(d)) {
            const [day, month, year] = d.split('/');
            return `${year}${month}${day}`;
          }
          try {
            const dateObj = new Date(d);
            if (!isNaN(dateObj.getTime())) {
              const y = dateObj.getFullYear();
              const m = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              return `${y}${m}${day}`;
            }
          } catch {
            setError('Formato de data inválido');
          }
          return '';
        };
        const todayNorm = normalizeDate(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`);
        filtered = filtered.filter(t => {
          if (t.effectiveDate) return false;
          const due = t.dueDate || '';
          const dueNorm = normalizeDate(typeof due === 'string' ? due.substring(0, 10) : '');
          return dueNorm !== '' && dueNorm < todayNorm;
        });
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

    // Helper para normalizar datas para YYYYMMDD
    const normalizeDate = (d: string) => {
      if (!d) return '';
      if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.replace(/-/g, '').substring(0, 8);
      if (/^\d{2}\/\d{2}\/\d{4}/.test(d)) {
        const [day, month, year] = d.split('/');
        return `${year}${month}${day}`;
      }
      try {
        const dateObj = new Date(d);
        if (!isNaN(dateObj.getTime())) {
          const y = dateObj.getFullYear();
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          return `${y}${m}${day}`;
        }
      } catch {
        setError('Formato de data inválido');
      }
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
      if (sortBy === 'dueDate' || sortBy === 'effectiveDate' || sortBy === 'createdAt') {
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
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setDescriptionFilter(e.target.value);
  const handleSortChange = (field: string, order: SortOrder) => { setSortBy(field); setSortOrder(order); };

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
              users={familyManagementEnabled ? users : []}
              userFilter={userFilter}
              onUserChange={handleUserChange}
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
