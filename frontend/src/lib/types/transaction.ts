// Tipos relacionados às transações

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId?: number;
  accountId: number;
  userId: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionCreateRequest {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId?: number;
  accountId: number;
  date: string;
}

export interface TransactionUpdateRequest {
  description?: string;
  amount?: number;
  type?: TransactionType;
  categoryId?: number;
  accountId?: number;
  date?: string;
}

// Enum para tipos de transação
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

// Interface para filtros de transação
export interface TransactionFilters {
  accountId?: number;
  categoryId?: number;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  description?: string;
}
