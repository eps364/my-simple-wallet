"use client";
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';

export type StatusFilter = 'all' | 'liquidated' | 'pending';
export type SortOrder = 'asc' | 'desc';

export interface FilterConfig {
  user?: {
    enabled: boolean;
    selectedUser: string;
    availableUsers: string[];
    onUserChange: (user: string) => void;
  };
  status?: {
    enabled: boolean;
    selectedStatus: StatusFilter;
    onStatusChange: (status: StatusFilter) => void;
  };
  account?: {
    enabled: boolean;
    selectedAccount: string;
    availableAccounts: Account[];
    onAccountChange: (accountId: string) => void;
  };
  category?: {
    enabled: boolean;
    selectedCategory: string;
    availableCategories: Category[];
    onCategoryChange: (categoryId: string) => void;
  };
  dateRange?: {
    enabled: boolean;
    startDate: string;
    endDate: string;
    onDateRangeChange: (startDate: string, endDate: string) => void;
  };
  sort?: {
    enabled: boolean;
    sortBy: string;
    sortOrder: SortOrder;
    sortOptions: Array<{ value: string; label: string }>;
    onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
  };
}

interface TransactionFiltersProps {
  readonly config: FilterConfig;
  readonly familyManagementEnabled?: boolean;
  readonly className?: string;
}

export default function TransactionFilters({ 
  config, 
  familyManagementEnabled = false,
  className = "" 
}: TransactionFiltersProps) {

  return (
    <div className={`p-4 rounded-lg border ${className}`}
      style={{ 
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Primeira linha - Filtros principais */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Filtro por Usuário */}
          {config.user?.enabled && config.user.availableUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <label 
                htmlFor="user-filter"
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Usuário:
              </label>
              <select
                id="user-filter"
                value={config.user.selectedUser}
                onChange={(e) => config.user?.onUserChange(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm min-w-40 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">Todos os usuários</option>
                {config.user.availableUsers.map(user => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por Status */}
          {config.status?.enabled && (
            <div className="flex items-center gap-2">
              <label 
                htmlFor="status-filter"
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Status:
              </label>
              <select
                id="status-filter"
                value={config.status.selectedStatus}
                onChange={(e) => config.status?.onStatusChange(e.target.value as StatusFilter)}
                className="px-3 py-2 rounded-lg border text-sm min-w-40 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">Todas</option>
                <option value="liquidated">Liquidadas</option>
                <option value="pending">Pendentes</option>
              </select>
            </div>
          )}

          {/* Filtro por Conta */}
          {config.account?.enabled && config.account.availableAccounts.length > 0 && (
            <div className="flex items-center gap-2">
              <label 
                htmlFor="account-filter"
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Conta:
              </label>
              <select
                id="account-filter"
                value={config.account.selectedAccount}
                onChange={(e) => config.account?.onAccountChange(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm min-w-40 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">Todas as contas</option>
                {config.account.availableAccounts.map(account => (
                  <option key={account.id} value={account.id.toString()}>
                    {account.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por Categoria */}
          {config.category?.enabled && config.category.availableCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <label 
                htmlFor="category-filter"
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Categoria:
              </label>
              <select
                id="category-filter"
                value={config.category.selectedCategory}
                onChange={(e) => config.category?.onCategoryChange(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm min-w-40 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">Todas as categorias</option>
                {config.category.availableCategories.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Segunda linha - Filtros de data e ordenação */}
        {(config.dateRange?.enabled || config.sort?.enabled) && (
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtro por Data */}
            {config.dateRange?.enabled && (
              <div className="flex items-center gap-2">
                <label 
                  htmlFor="date-range-start"
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  Período:
                </label>
                <input
                  id="date-range-start"
                  type="date"
                  value={config.dateRange.startDate}
                  onChange={(e) => config.dateRange?.onDateRangeChange(e.target.value, config.dateRange.endDate)}
                  className="px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <span 
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  até
                </span>
                <input
                  id="date-range-end"
                  type="date"
                  value={config.dateRange.endDate}
                  onChange={(e) => config.dateRange?.onDateRangeChange(config.dateRange.startDate, e.target.value)}
                  className="px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            {/* Ordenação */}
            {config.sort?.enabled && (
              <>
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="sort-by"
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Ordenar por:
                  </label>
                  <select
                    id="sort-by"
                    value={config.sort.sortBy}
                    onChange={(e) => config.sort?.onSortChange(e.target.value, config.sort.sortOrder)}
                    className="px-3 py-2 rounded-lg border text-sm min-w-40 focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {config.sort.sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => config.sort?.onSortChange(config.sort.sortBy, config.sort.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-background)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {config.sort.sortOrder === 'asc' ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Crescente
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Decrescente
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Indicadores ativos */}
        <div className="flex flex-wrap gap-2">
          {config.user?.selectedUser && config.user.selectedUser !== 'all' && (
            <span 
              className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
              style={{
                backgroundColor: 'var(--color-primary-bg, rgba(59, 130, 246, 0.1))',
                color: 'var(--color-primary)'
              }}
            >
              Usuário: {config.user.selectedUser}
              <button
                onClick={() => config.user?.onUserChange('all')}
                className="hover:opacity-80"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {config.status?.selectedStatus && config.status.selectedStatus !== 'all' && (
            <span 
              className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
              style={{
                backgroundColor: 'var(--color-success-bg, rgba(34, 197, 94, 0.1))',
                color: 'var(--color-success)'
              }}
            >
              Status: {config.status.selectedStatus === 'liquidated' ? 'Liquidadas' : 'Pendentes'}
              <button
                onClick={() => config.status?.onStatusChange('all')}
                className="hover:opacity-80"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {familyManagementEnabled && (
            <span 
              className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
              style={{
                backgroundColor: 'var(--color-success-bg, rgba(34, 197, 94, 0.1))',
                color: 'var(--color-success)'
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Modo Familiar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
