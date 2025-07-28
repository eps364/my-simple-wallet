"use client";
import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Transaction, TransactionType } from '@/lib/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryTrendsChartProps {
  readonly transactions: Transaction[];
}

export default function CategoryTrendsChart({ transactions }: CategoryTrendsChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Processar dados para o gráfico
  const processData = () => {
    const expenseTransactions = transactions.filter(t => 
      t.type === TransactionType.EXPENSE && t.effectiveDate && t.category
    );

    if (expenseTransactions.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Obter todas as categorias e calcular totais
    const categoryTotals: { [key: string]: number } = {};
    const allMonths = new Set<string>();

    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Sem Categoria';
      const amount = transaction.effectiveAmount || transaction.amount;
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;

      // Coletar todos os meses
      if (transaction.effectiveDate) {
        const [, month, year] = transaction.effectiveDate.split('/');
        allMonths.add(`${month}/${year}`);
      }
    });

    // Obter as top 5 categorias por valor total
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

    // Ordenar todos os meses
    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      return new Date(parseInt(yearA), parseInt(monthA) - 1).getTime() - 
             new Date(parseInt(yearB), parseInt(monthB) - 1).getTime();
    });

    // Inicializar dados mensais para todas as categorias e meses
    const monthlyData: { [category: string]: { [month: string]: number } } = {};
    
    topCategories.forEach(category => {
      monthlyData[category] = {};
      sortedMonths.forEach(month => {
        monthlyData[category][month] = 0;
      });
    });

    // Preencher dados reais
    expenseTransactions
      .filter(t => topCategories.includes(t.category || 'Sem Categoria'))
      .forEach(transaction => {
        if (transaction.effectiveDate) {
          const [, month, year] = transaction.effectiveDate.split('/');
          const monthKey = `${month}/${year}`;
          const category = transaction.category || 'Sem Categoria';
          const amount = transaction.effectiveAmount || transaction.amount;
          
          if (monthlyData[category]?.[monthKey] !== undefined) {
            monthlyData[category][monthKey] += amount;
          }
        }
      });

    // Cores para as linhas
    const colors = [
      'rgba(239, 68, 68, 1)',    // Vermelho
      'rgba(34, 197, 94, 1)',    // Verde
      'rgba(59, 130, 246, 1)',   // Azul
      'rgba(251, 191, 36, 1)',   // Amarelo
      'rgba(168, 85, 247, 1)',   // Roxo
    ];

    const datasets = topCategories.map((category, index) => ({
      label: category,
      data: sortedMonths.map(month => monthlyData[category][month] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 4,
      pointHoverRadius: 6,
    }));

    return { labels: sortedMonths, datasets };
  };

  const { labels, datasets } = processData();

  const chartData = {
    labels,
    datasets,
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
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'var(--color-surface)',
        titleColor: 'var(--color-text)',
        bodyColor: 'var(--color-text)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        callbacks: {
          title: function(tooltipItems: Array<{ label: string }>) {
            const monthYear = tooltipItems[0]?.label;
            if (monthYear) {
              const [month, year] = monthYear.split('/');
              const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
              ];
              return `${monthNames[parseInt(month) - 1]} de ${year}`;
            }
            return monthYear;
          },
          label: function(tooltipItem: { dataset: { label?: string }, parsed: { y: number } }) {
            const label = tooltipItem.dataset.label || '';
            return `${label}: R$ ${tooltipItem.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          },
          afterBody: function(tooltipItems: Array<{ parsed: { y: number } }>) {
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
            return total > 0 ? [`Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`] : [];
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
        },
        title: {
          display: true,
          text: 'Valor (R$)',
          color: 'var(--color-text)',
        }
      },
      x: {
        ticks: {
          color: 'var(--color-text)',
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: 'var(--color-border)',
        },
        title: {
          display: true,
          text: 'Mês/Ano',
          color: 'var(--color-text)',
        }
      }
    },
  };

  if (labels.length === 0 || datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Nenhum dado de tendência de categoria encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
