"use client";
import { useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Transaction, TransactionType } from '@/lib/types/transaction';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryDistributionChartProps {
  readonly transactions: Transaction[];
}

export default function CategoryDistributionChart({ transactions }: CategoryDistributionChartProps) {
  const chartRef = useRef<ChartJS<"doughnut">>(null);

  // Processar dados para o gráfico
  const processData = () => {
    const expenseTransactions = transactions.filter(t => 
      t.type === TransactionType.EXPENSE && t.effectiveDate && t.category
    );
    
    // Agrupar por categoria
    const categoryData: { [key: string]: number } = {};
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Sem Categoria';
      const amount = transaction.effectiveAmount || transaction.amount;
      
      if (categoryData[category]) {
        categoryData[category] += amount;
      } else {
        categoryData[category] = amount;
      }
    });

    // Ordenar por valor (maior para menor)
    const sortedEntries = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);

    const labels = sortedEntries.map(([category]) => category);
    const data = sortedEntries.map(([, amount]) => amount);

    // Cores para o gráfico
    const colors = [
      'rgba(239, 68, 68, 0.8)',   // Vermelho
      'rgba(34, 197, 94, 0.8)',   // Verde
      'rgba(59, 130, 246, 0.8)',  // Azul
      'rgba(251, 191, 36, 0.8)',  // Amarelo
      'rgba(168, 85, 247, 0.8)',  // Roxo
      'rgba(236, 72, 153, 0.8)',  // Rosa
      'rgba(14, 165, 233, 0.8)',  // Azul claro
      'rgba(16, 185, 129, 0.8)',  // Verde claro
      'rgba(245, 101, 101, 0.8)', // Vermelho claro
      'rgba(139, 69, 19, 0.8)',   // Marrom
    ];

    const borderColors = [
      'rgba(239, 68, 68, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(59, 130, 246, 1)',
      'rgba(251, 191, 36, 1)',
      'rgba(168, 85, 247, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(14, 165, 233, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 101, 101, 1)',
      'rgba(139, 69, 19, 1)',
    ];

    return { 
      labels, 
      data, 
      backgroundColor: colors.slice(0, labels.length),
      borderColors: borderColors.slice(0, labels.length)
    };
  };

  const { labels, data, backgroundColor, borderColors } = processData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Gastos por Categoria',
        data,
        backgroundColor,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--color-text)',
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: { label: string, parsed: number }) {
            const total = data.reduce((sum, value) => sum + value, 0);
            const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
            return `${tooltipItem.label}: R$ ${tooltipItem.parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Nenhum gasto por categoria encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Doughnut ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
