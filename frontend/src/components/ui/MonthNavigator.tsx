
"use client";

import React from 'react';

interface MonthNavigatorProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  className?: string;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentDate, onDateChange, className }) => {
  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    onDateChange(newDate);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className={`flex items-center justify-center gap-4 p-4 rounded-lg border ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <button
        onClick={handlePreviousMonth}
        className="px-4 py-2 rounded-lg border text-sm transition-all focus:outline-none"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)'
        }}
      >
        &lt; Anterior
      </button>
      <div className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
        {monthName.charAt(0).toUpperCase() + monthName.slice(1)} de {year}
      </div>
      <button
        onClick={handleNextMonth}
        className="px-4 py-2 rounded-lg border text-sm transition-all focus:outline-none"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)'
        }}
      >
        Próximo &gt;
      </button>
    </div>
  );
};

export default MonthNavigator;
