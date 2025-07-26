/**
 * Transactions Service - Responsável apenas pelas operações de transações
 * Seguindo o princípio Single Responsibility: gerencia apenas entidade Transaction
 */

import { Transaction, TransactionCreateRequest, TransactionUpdateRequest } from '@/lib/types/transaction';
import { apiRequest, fetchConfig } from './baseService';

export class TransactionsService {
  private readonly endpoint = '/transactions';

  // Listar todas as transações
  async getAll(): Promise<Transaction[]> {
    return apiRequest<Transaction[]>(this.endpoint, fetchConfig());
  }

  // Buscar transação por ID
  async getById(id: number): Promise<Transaction> {
    return apiRequest<Transaction>(`${this.endpoint}/${id}`, fetchConfig());
  }

  // Criar nova transação
  async create(data: TransactionCreateRequest): Promise<Transaction> {
    return apiRequest<Transaction>(this.endpoint, fetchConfig('POST', data));
  }

  // Atualizar transação
  async update(id: number, data: TransactionUpdateRequest): Promise<Transaction> {
    return apiRequest<Transaction>(`${this.endpoint}/${id}`, fetchConfig('PUT', data));
  }

  // Deletar transação
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`${this.endpoint}/${id}`, fetchConfig('DELETE'));
  }
}

// Instância singleton do serviço de transações
export const transactionsService = new TransactionsService();
