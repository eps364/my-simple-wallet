// Tipos relacionados às contas

export interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency?: string;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountCreateRequest {
  name: string;
  type: string;
  balance?: number;
  currency?: string;
}

export interface AccountUpdateRequest {
  name?: string;
  type?: string;
  balance?: number;
  currency?: string;
}

// Enum para tipos de conta
export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT'
}
