// Tipos relacionados às transações

export interface Transaction {
  installments: never[];
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  dueDate: string;
  effectiveDate?: string;
  effectiveAmount?: number;
  accountId: number;
  account?: string;
  categoryId?: number;
  category?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionCreateRequest {
  description: string;
  amount: number;
  type: TransactionType;
  dueDate: string;
  effectiveDate?: string;
  effectiveAmount?: number;
  accountId: number;
  categoryId?: number;
  qtdeInstallments?: number;
}

export interface TransactionUpdateRequest {
  description?: string;
  amount?: number;
  type?: TransactionType;
  dueDate?: string;
  effectiveDate?: string;
  effectiveAmount?: number;
  accountId?: number;
  categoryId?: number;
}

// Enum para tipos de transação
export enum TransactionType {
  INCOME = 0,
  EXPENSE = 1,
}

// Interface para filtros de transação
export interface TransactionFilters {
  accountId?: number;
  categoryId?: number;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  description?: string;
  username?: string;
  sort?: string;
  order?: "asc" | "desc";
}
