
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';
import { Transaction, TransactionType } from '@/lib/types/transaction';
import { User } from '@/lib/types/user';
import React from 'react';

interface TransactionCardProps {
  transaction: Transaction;
  currentUser: User | null;
  familyManagementEnabled: boolean;
  getAccountName: (accountId: number) => string;
  getCategoryName: (categoryId?: number) => string;
  formatDate: (dateString: string) => string;
  canEditTransaction: (transaction: Transaction) => boolean;
  onEdit: (transaction: Transaction) => void;
  onSettle: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  status: string;
  styles?: React.CSSProperties | { [key: string]: React.CSSProperties };
}

type ThemeStyles = {
  surface?: React.CSSProperties;
  border: { borderColor: string };
  text: { color: string };
  textSecondary: { color: string };
  textMuted: { color: string };
  background?: React.CSSProperties;
};

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  currentUser,
  familyManagementEnabled,
  getAccountName,
  getCategoryName,
  formatDate,
  canEditTransaction,
  onEdit,
  onSettle,
  onDelete,
  status,
  styles: propStyles,
}) => {
  const themeStyles = useThemeStyles();
  const styles = propStyles || themeStyles;

  // Type guards para acessar propriedades de tema
  const getStyleProp = <T,>(key: keyof ThemeStyles, fallback?: T): T | undefined => {
    if (styles && typeof styles === 'object' && key in styles) {
      return (styles as ThemeStyles)[key] as T;
    }
    return fallback;
  };

  return (
    <div
      tabIndex={0}
      style={{
        ...(typeof (styles as ThemeStyles).surface === 'object'
          ? (styles as ThemeStyles).surface!
          : {}),
        borderColor: (styles as ThemeStyles).border?.borderColor || undefined,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="rounded-lg border p-6 transition-all hover:shadow-md"
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow =
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Descrição */}
      <h3
        style={{
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'normal',
        }}
        className="text-lg font-semibold cursor-pointer"
        title={transaction.description}
      >
        {transaction.description}
      </h3>

      {/* Conta | Categoria */}
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: getStyleProp<{ color: string }>('textSecondary')?.color }} className="text-sm">
          {getAccountName(transaction.accountId)}
        </span>
        <span
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium opacity-90"
        >
          {getCategoryName(transaction.categoryId)}
        </span>
      </div>

      {/* Valor */}
      {!(transaction.effectiveDate && transaction.effectiveAmount !== undefined && transaction.amount === transaction.effectiveAmount) && (
        <div className="mb-1">
          <div className="flex items-center justify-between">
            <span style={{ color: getStyleProp<{ color: string }>('textSecondary')?.color }} className="text-sm">
              Valor
            </span>
            <span
              className={`
                ${transaction.effectiveAmount !== undefined && transaction.effectiveAmount !== null ? 'text-xl' : 'text-2xl'}
                font-bold
                ${transaction.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
              `}
            >
              {transaction.type === TransactionType.INCOME ? '+' : '-'} R${' '}
              {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Valor Efetivo (destaque) */}
      {transaction.effectiveAmount !== undefined && transaction.effectiveAmount !== null && (
        <div className="mb-1">
          <div className="flex items-center justify-between">
            <span style={{ color: getStyleProp<{ color: string }>('textSecondary')?.color }} className="text-sm">
              Valor Efetivo
            </span>
            <span
              className={`
                ${transaction.effectiveAmount !== undefined && transaction.effectiveAmount !== null ? 'text-3xl' : 'text-2xl'}
                font-extrabold
                ${transaction.type === TransactionType.INCOME ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}
              `}
            >
              {transaction.type === TransactionType.INCOME ? '+' : '-'} R${' '}
              {transaction.effectiveAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Vencimento | Data Efetiva */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <span style={{ color: getStyleProp<{ color: string }>('textSecondary')?.color }} className="text-xs">
            Vencimento
          </span>
          <span style={{ color: getStyleProp<{ color: string }>('text')?.color }} className="text-sm font-medium">
            {formatDate(transaction.dueDate)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span style={{ color: getStyleProp<{ color: string }>('textSecondary')?.color }} className="text-xs">
            Data Efetiva
          </span>
          <span style={{ color: getStyleProp<{ color: string }>('textMuted')?.color }} className="text-sm">
            {transaction.effectiveDate ? formatDate(transaction.effectiveDate) : '-'}
          </span>
        </div>
      </div>

      {/* Tags: Liquidada | Atrasada */}
      <div className="mb-2 flex gap-2">
        {status === 'liquidated' && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Liquidada
          </span>
        )}
        {status === 'overdue' && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="5" />
            </svg>
            Atrasada
          </span>
        )}
        {status === 'pending' && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Pendente
          </span>
        )}
      </div>

      {/* Footer - User à esquerda, botões à direita */}
      <div
        style={{ borderColor: getStyleProp<{ borderColor: string }>('border')?.borderColor }}
        className="flex justify-between items-center pt-4 border-t gap-3 mt-auto"
      >
        {/* Username (lado esquerdo) */}
        <div className="flex items-center min-w-0 flex-1">
          {familyManagementEnabled && currentUser?.isParent && transaction.username && (
            <span
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-md flex items-center transition-all shadow-sm"
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.color = 'var(--color-text)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {transaction.username}
            </span>
          )}
        </div>
        {/* Botões de ação (lado direito) */}
        <div className="flex space-x-1 flex-shrink-0">
          {canEditTransaction(transaction) ? (
            <>
              <button
                onClick={() => onEdit(transaction)}
                style={{ color: 'var(--color-primary)', backgroundColor: 'transparent' }}
                className="px-2 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center min-w-[36px]"
                title="Editar transação"
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              {!transaction.effectiveDate && (
                <button
                  onClick={() => onSettle(transaction)}
                  style={{ color: 'var(--color-success)', backgroundColor: 'transparent' }}
                  className="px-2 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center min-w-[36px]"
                  title="Liquidar transação"
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--color-success)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-success)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onDelete(transaction)}
                style={{ color: 'var(--color-error)', backgroundColor: 'transparent' }}
                className="px-2 py-2 text-sm font-medium rounded-lg transition-all min-w-[36px] flex items-center justify-center"
                title="Excluir transação"
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-error)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-error)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div
              style={{
                ...(getStyleProp<React.CSSProperties>('background') || {}),
                borderColor: getStyleProp<{ borderColor: string }>('border')?.borderColor,
                color: getStyleProp<{ color: string }>('textMuted')?.color,
              }}
              className="px-3 py-2 text-xs text-center rounded-lg border flex items-center justify-center"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M0 0h24v24H0z"
                />
              </svg>
              <span className="whitespace-nowrap">Apenas Visualização</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TransactionCard;
