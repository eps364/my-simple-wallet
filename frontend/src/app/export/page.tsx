"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { transactionsService } from '@/lib/services/transactionsService';
import { Transaction, TransactionFilters } from '@/lib/types/transaction';
import TransactionFiltersComponent, { StatusFilter, FilterConfig } from '@/components/ui/TransactionFilters';

export default function ExportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [filter, setFilter] = useState<TransactionFilters>({});
  const filterConfig: FilterConfig = {
    status: {
      enabled: true,
      selectedStatus: statusFilter,
      onStatusChange: setStatusFilter
    },
    // Adicione outros filtros conforme necessário (account, category, dateRange, etc)
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function getFamilyManagementEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('familyManagementEnabled');
    return stored === 'true';
  }

  const handleLoad = async () => {
    setLoading(true);
    setError('');
    try {
      const isParent = getFamilyManagementEnabled();
      let data = await transactionsService.getAll(isParent);
      // Filtros compartilhados
      data = data.filter((tx: Transaction) => {
        let match = true;
        if (filter.dateFrom) {
          match = match && new Date(tx.dueDate) >= new Date(filter.dateFrom);
        }
        if (filter.dateTo) {
          match = match && new Date(tx.dueDate) <= new Date(filter.dateTo);
        }
        if (filter.accountId) {
          match = match && tx.accountId === filter.accountId;
        }
        if (filter.categoryId) {
          match = match && tx.categoryId === filter.categoryId;
        }
        if (filter.type !== undefined) {
          match = match && tx.type === filter.type;
        }
        if (filter.description) {
          match = match && tx.description?.toLowerCase().includes(filter.description.toLowerCase());
        }
        return match;
      });
      setTransactions(data);
    } catch {
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Exportar para XLSX
  const handleExport = () => {
    if (!transactions.length) return;
    // Exporta apenas os dados filtrados
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacoes');
    XLSX.writeFile(workbook, 'transacoes-filtradas.xlsx');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Exportar Transações</h1>
      {/* Filtros compartilhados - mesmo componente das páginas de transação e relatório */}
      <div className="mb-4">
        <TransactionFiltersComponent config={filterConfig} />
        <button
          type="button"
          onClick={handleLoad}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          disabled={loading}
        >
          Carregar
        </button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={!transactions.length}
        >
          Exportar XLSX
        </button>
      </div>
      {/* Preview dos dados */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              {/* Renderiza os headers dinamicamente */}
              {transactions[0] && Object.keys(transactions[0]).map(key => (
                <th key={key} className="border px-2 py-1">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id || JSON.stringify(tx)}>
                {Object.entries(tx).map(([key, val]) => (
                  <td key={key} className="border px-2 py-1">{typeof val === 'string' || typeof val === 'number' ? val : JSON.stringify(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
