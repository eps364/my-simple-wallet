"use client";
import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Transaction, TransactionType } from '@/lib/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyBalanceChartProps {
  readonly transactions: Transaction[];
}

export default function MonthlyBalanceChart({ transactions }: MonthlyBalanceChartProps) {
  const chartRef = useRef<ChartJS>(null);

  // Processar dados para o gráfico
  const processData = () => {
    const effectiveTransactions = transactions.filter(t => t.effectiveDate);
    
    // Agrupar por mês
    const monthlyData: { [key: string]: { income: number, expense: number } } = {};
    
    effectiveTransactions.forEach(transaction => {
      if (transaction.effectiveDate) {
        // Assumindo formato DD/MM/YYYY
        const [, month, year] = transaction.effectiveDate.split('/');
        const monthKey = `${month}/${year}`;
        const amount = transaction.effectiveAmount || transaction.amount;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === TransactionType.INCOME) {
          monthlyData[monthKey].income += amount;
        } else {
          monthlyData[monthKey].expense += amount;
        }
      }
    });

    // Ordenar por data
    const sortedEntries = Object.entries(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a[0].split('/');
      const [monthB, yearB] = b[0].split('/');
      return new Date(parseInt(yearA), parseInt(monthA) - 1).getTime() - 
             new Date(parseInt(yearB), parseInt(monthB) - 1).getTime();
    });

    const labels = sortedEntries.map(([month]) => month);
    const incomeData = sortedEntries.map(([, data]) => data.income);
    const expenseData = sortedEntries.map(([, data]) => data.expense);
    const balanceData = sortedEntries.map(([, data]) => data.income - data.expense);

    return { labels, incomeData, expenseData, balanceData };
  };

  const { labels, incomeData, expenseData, balanceData } = processData();

  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Entradas',
        data: incomeData,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Saídas',
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Balanço',
        data: balanceData,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
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
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: 'var(--color-text)',
          callback: function(value: number | string) {
            return `R$ ${Number(value).toLocaleString('pt-BR')}`;
          }
        },
        grid: {
          drawOnChartArea: false,
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
          Nenhum dado de balanço encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Chart ref={chartRef} type="bar" data={chartData} options={options} />
    </div>
  );
}
