import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

interface Props {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
    }[];
  };
}

const ExpensesByCategoryChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const styles = useThemeStyles();

  useEffect(() => {
    if (chartRef && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const chart = new Chart(chartRef.current, {
        type: 'pie', // Ou 'bar', 'line', etc.
        data: data,
        options: {
          plugins: {
            legend: {
              labels: {
                color: styles.text.color, // Aplica a cor do texto do tema
              },
            },
          },
          color: styles.text.color, // Aplica a cor padrão para textos do gráfico
        },
      });
      chartInstance.current = chart;
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, styles.text.color]);

  return <canvas ref={chartRef} />;
};

export default ExpensesByCategoryChart;