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

interface PaidChartProps {
  readonly transactions: Transaction[];
}

export default function PaidChart({ transactions }: PaidChartProps) {
  const chartRef = useRef<ChartJS<"bar">>(null);

  // Processar dados para o gráfico (contas pagas - transações com effectiveDate)
  const processData = () => {
    const paidTransactions = transactions.filter(t => 
      t.type === TransactionType.EXPENSE && t.effectiveDate
    );
    
    // Agrupar por mês de pagamento
    const monthlyPaid: { [key: string]: number } = {};
    
    paidTransactions.forEach(transaction => {
      if (transaction.effectiveDate) {
        // Assumindo formato DD/MM/YYYY
        const [, month, year] = transaction.effectiveDate.split('/');
        const monthKey = `${month}/${year}`;
        const amount = transaction.effectiveAmount || transaction.amount;
        
        if (monthlyPaid[monthKey]) {
          monthlyPaid[monthKey] += amount;
        } else {
          monthlyPaid[monthKey] = amount;
        }
      }
    });

    // Ordenar por data
    const sortedEntries = Object.entries(monthlyPaid).sort((a, b) => {
      const [monthA, yearA] = a[0].split('/');
      const [monthB, yearB] = b[0].split('/');
      return new Date(parseInt(yearA), parseInt(monthA) - 1).getTime() - 
             new Date(parseInt(yearB), parseInt(monthB) - 1).getTime();
    });

    const labels = sortedEntries.map(([month]) => month);
    const data = sortedEntries.map(([, amount]) => amount);

    return { labels, data };
  };

  const { labels, data } = processData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Contas Pagas (R$)',
        data,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
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

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Nenhuma conta paga encontrada
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
