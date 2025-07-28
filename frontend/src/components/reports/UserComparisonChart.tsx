"use client";
import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Transaction, TransactionType } from '@/lib/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UserComparisonChartProps {
  readonly transactions: Transaction[];
}

export default function UserComparisonChart({ transactions }: UserComparisonChartProps) {
  const chartRef = useRef<ChartJS<"bar">>(null);

  const processData = () => {
    const effectiveTransactions = transactions.filter(t => t.effectiveDate && t.username);
    
    const userData: { [key: string]: { income: number, expense: number } } = {};
    
    effectiveTransactions.forEach(transaction => {
      const username = transaction.username || 'Usuário Desconhecido';
      const amount = transaction.effectiveAmount || transaction.amount;
      
      if (!userData[username]) {
        userData[username] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === TransactionType.INCOME) {
        userData[username].income += amount;
      } else {
        userData[username].expense += amount;
      }
    });

    const sortedEntries = Object.entries(userData).sort((a, b) => {
      const totalA = a[1].income + a[1].expense;
      const totalB = b[1].income + b[1].expense;
      return totalB - totalA;
    });

    const labels = sortedEntries.map(([username]) => username);
    const incomeData = sortedEntries.map(([, data]) => data.income);
    const expenseData = sortedEntries.map(([, data]) => data.expense);

    return { labels, incomeData, expenseData };
  };

  const { labels, incomeData, expenseData } = processData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Entradas (R$)',
        data: incomeData,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Saídas (R$)',
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'var(--color-text)',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: { dataset: { label?: string }, parsed: { y: number } }) {
            const label = tooltipItem.dataset.label || '';
            return `${label}: R$ ${tooltipItem.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'var(--color-text)',
          callback: function(value: number | string) {
            return `R$ ${Number(value).toLocaleString('pt-BR')}`;
          }
        },
        grid: {
          color: 'var(--color-border)',
        }
      },
      x: {
        ticks: {
          color: 'var(--color-text)',
        },
        grid: {
          color: 'var(--color-border)',
        }
      }
    },
  };

  if (labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Nenhum dado de usuário encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
