// Tipos relacionados às contas

export interface Account {
  id: number;
  description: string;
  balance: number;
  credit?: number;
  dueDate?: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountCreateRequest {
  description: string;
  balance?: number;
  credit?: number;
  dueDate?: number;
}

export interface AccountUpdateRequest {
  description?: string;
  balance?: number;
  credit?: number;
  dueDate?: number;
}

// // Enum para tipos de conta (mantido para compatibilidade)
// export enum AccountType {
//   CHECKING = 'CHECKING',
//   SAVINGS = 'SAVINGS',
//   CREDIT = 'CREDIT',
//   INVESTMENT = 'INVESTMENT'
// }
