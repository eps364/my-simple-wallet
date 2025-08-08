"use client";
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';
import { StatusFilter, SortOrder } from '@/components/ui/TransactionFilters';
import { TransactionType } from '@/lib/types/transaction';
import React, { useState, useEffect } from 'react';

import { User } from '@/lib/types/user';

export interface AdvancedTransactionFiltersProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  accountFilter: string;
  onAccountChange: (accountId: string) => void;
  accounts: Account[];
  categoryFilter: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
  typeFilter: string;
  onTypeChange: (type: string) => void;
  descriptionFilter: string;
  onDescriptionChange: (value: string) => void;
  sortBy: string;
  sortOrder: SortOrder;
  onSortChange: (field: string, order: SortOrder) => void;
  className?: string;
  onClearFilters?: () => void;
  users?: User[];
  userFilter?: string;
  onUserChange?: (username: string) => void;
}

const AdvancedTransactionFilters: React.FC<AdvancedTransactionFiltersProps> = ({
  statusFilter,
  onStatusChange,
  accountFilter,
  onAccountChange,
  accounts,
  categoryFilter,
  onCategoryChange,
  categories,
  typeFilter,
  onTypeChange,
  descriptionFilter,
  onDescriptionChange,
  sortBy,
  sortOrder,
  onSortChange,
  className = '',
  onClearFilters,
  users,
  userFilter,
  onUserChange
}) => {
  const [open, setOpen] = useState(false);
  const [descInput, setDescInput] = useState(descriptionFilter);
  const [descLoading, setDescLoading] = useState(false);

  // Debounce para busca por descrição
  useEffect(() => {
    setDescInput(descriptionFilter);
  }, [descriptionFilter]);

  useEffect(() => {
    if (descInput === descriptionFilter) return;
    setDescLoading(true);
    const handler = setTimeout(() => {
      onDescriptionChange(descInput);
      setDescLoading(false);
    }, 500);
    return () => clearTimeout(handler);
  }, [descInput]);

  return (
    <div className={className}>
      <div className="relative inline-block text-left w-full">
        <button
          type="button"
          className="inline-flex justify-between items-center w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setOpen((prev) => !prev)}
        >
          Filtros avançados
          <svg className={`ml-2 h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.584l3.71-3.354a.75.75 0 111.02 1.1l-4.25 3.846a.75.75 0 01-1.02 0l-4.25-3.846a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        {open && (
          <div className="absolute z-20 mt-2 w-full min-w-[320px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col gap-4">

              <div className="flex flex-wrap gap-4">
                {users && users.length > 0 && userFilter !== undefined && onUserChange && (
                  <div className="flex flex-col gap-1 min-w-32">
                    <label htmlFor="user-filter" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Usuário:</label>
                    <select id="user-filter" value={userFilter} onChange={e => onUserChange(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
                      <option value="all">Todos</option>
                      {users.map(user => (
                        <option key={user.username} value={user.username}>{user.name || user.username}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-1 min-w-32">
                  <label htmlFor="status-filter" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Status:</label>
                  <select id="status-filter" value={statusFilter} onChange={e => onStatusChange(e.target.value as StatusFilter)} className="px-3 py-2 rounded-lg border text-sm">
                    <option value="all">Todas</option>
                    <option value="liquidated">Liquidadas</option>
                    <option value="pending">Pendentes</option>
                    <option value="overdue">Atrasadas</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 min-w-32">
                  <label htmlFor="account-filter" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Conta:</label>
                  <select id="account-filter" value={accountFilter} onChange={e => onAccountChange(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
                    <option value="all">Todas</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.description}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1 min-w-32">
                  <label htmlFor="category-filter" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Categoria:</label>
                  <select id="category-filter" value={categoryFilter} onChange={e => onCategoryChange(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
                    <option value="all">Todas</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1 min-w-32">
                  <label htmlFor="type-filter" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Tipo:</label>
                  <select id="type-filter" value={typeFilter} onChange={e => onTypeChange(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
                    <option value="all">Todos</option>
                    <option value={TransactionType.INCOME}>Receita</option>
                    <option value={TransactionType.EXPENSE}>Despesa</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 min-w-40">
                  <label htmlFor="description-filter" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Descrição:</label>
                  <div className="relative">
                    <input id="description-filter" type="text" value={descInput} onChange={e => setDescInput(e.target.value)} placeholder="Buscar..." className="px-3 py-2 rounded-lg border text-sm pr-8" />
                    {descLoading && (
                      <span className="absolute right-2 top-2 animate-spin text-gray-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 min-w-32">
                  <label htmlFor="sort-by" className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Ordenar por:</label>
                  <select id="sort-by" value={sortBy} onChange={e => onSortChange(e.target.value, sortOrder)} className="px-3 py-2 rounded-lg border text-sm">
                    <option value="type">Tipo</option>
                    <option value="accountId">Conta</option>
                    <option value="categoryId">Categoria</option>
                    <option value="description">Descrição</option>
                    <option value="amount">Valor</option>
                    <option value="dueDate">Data de Vencimento</option>
                    <option value="effectiveAmount">Valor Efetivo</option>
                    <option value="effectiveDate">Data Efetiva</option>
                    <option value="username">Usuário</option>
                    <option value="id">ID</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text)', visibility: 'hidden' }}>Ordem</label>
                  <button type="button" onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 rounded-lg border text-sm h-[40px]">
                    {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                  </button>
                </div>
              </div>
              {onClearFilters && (
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="px-4 py-2 rounded-lg border text-sm bg-gray-100 hover:bg-gray-200 transition-all"
                    style={{ color: 'var(--color-error)', borderColor: 'var(--color-border)' }}
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedTransactionFilters;
