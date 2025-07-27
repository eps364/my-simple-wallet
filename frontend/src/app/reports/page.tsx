"use client";
import { useEffect, useState } from 'react';
import { Transaction } from '@/lib/types/transaction';
import { transactionsService } from '@/lib/services/transactionsService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import IncomeChart from '@/components/reports/IncomeChart';
import ExpenseChart from '@/components/reports/ExpenseChart';
import PayableChart from '@/components/reports/PayableChart';
import PaidChart from '@/components/reports/PaidChart';
import MonthlyBalanceChart from '@/components/reports/MonthlyBalanceChart';
import CategoryDistributionChart from '@/components/reports/CategoryDistributionChart';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getAll();
      setTransactions(data);
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Relatórios Financeiros
            </h1>
            <p 
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Visualize seus dados financeiros através de gráficos interativos
            </p>
          </div>

          {/* Grid de Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
