"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { transactionsService } from '@/lib/services/transactionsService';
import { Transaction, TransactionFilters } from '@/lib/types/transaction';
import TransactionFiltersComponent, { StatusFilter, FilterConfig } from '@/components/ui/TransactionFilters';

export default function ImportPage() {
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
  const [file, setFile] = useState<File | null>(null);
  const [imported, setImported] = useState(false);

  function getFamilyManagementEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('familyManagementEnabled');
    return stored === 'true';
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setImported(false);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: Transaction[] = XLSX.utils.sheet_to_json(worksheet);
      // Aqui você pode enviar para o backend ou tratar os dados
      // Exemplo: await transactionsService.import(json);
      setTransactions(json);
      setImported(true);
    } catch {
      setError('Erro ao importar arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Importar Transações</h1>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="border px-2 py-1 rounded"
        />
        <button
          type="button"
          onClick={handleImport}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded mt-4"
          disabled={loading || !file}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0-8l-4 4m4-4l4 4M4 4h16" />
          </svg>
          Importar XLSX
        </button>
      </div>
      {imported && <div className="text-green-600 mb-2">Arquivo importado com sucesso!</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {/* Preview dos dados importados */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              {transactions[0] && Object.keys(transactions[0]).map(key => (
                <th key={key} className="border px-2 py-1">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={tx.id || idx}>
                {Object.entries(tx).map(([key, val]) => (
                  <td key={key} className="border px-2 py-1">{val === null || val === undefined ? "" : (typeof val === 'string' || typeof val === 'number' ? val : JSON.stringify(val))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
