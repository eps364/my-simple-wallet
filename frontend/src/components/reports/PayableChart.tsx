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

interface PayableChartProps {
  readonly transactions: Transaction[];
}

export default function PayableChart({ transactions }: PayableChartProps) {
  const chartRef = useRef<ChartJS<"bar">>(null);

  const processData = () => {
    const payableTransactions = transactions.filter(t => 
      t.type === TransactionType.EXPENSE && !t.effectiveDate && t.dueDate
    );
    
    const monthlyPayable: { [key: string]: number } = {};
    
    payableTransactions.forEach(transaction => {
      if (transaction.dueDate) {
        const [, month, year] = transaction.dueDate.split('/');
        const monthKey = `${month}/${year}`;
        const amount = transaction.amount;
        
        if (monthlyPayable[monthKey]) {
          monthlyPayable[monthKey] += amount;
        } else {
          monthlyPayable[monthKey] = amount;
        }
      }
    });

    const sortedEntries = Object.entries(monthlyPayable).sort((a, b) => {
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
        label: 'Contas a Pagar (R$)',
        data,
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
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
          Nenhuma conta a pagar encontrada
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
