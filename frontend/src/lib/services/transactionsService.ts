/**
 * Transactions Service - Responsável apenas pelas operações de transações
 * Seguindo o princípio Single Responsibility: gerencia apenas entidade Transaction
 */

import { Transaction, TransactionCreateRequest, TransactionUpdateRequest } from '@/lib/types/transaction';
import { apiRequest, fetchConfig } from './baseService';

export class TransactionsService {
  private readonly endpoint = '/transactions';

  // Converter data de YYYY-MM-DD para DD/MM/YYYY
  private formatDateForBackend(date: string): string {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  // Preparar dados para envio ao backend
  private prepareDataForBackend(data: TransactionCreateRequest | TransactionUpdateRequest): TransactionCreateRequest | TransactionUpdateRequest {
    const preparedData = { ...data };
    
    if ('dueDate' in data && data.dueDate) {
      preparedData.dueDate = this.formatDateForBackend(data.dueDate);
    }
    
    if ('effectiveDate' in data && data.effectiveDate) {
      preparedData.effectiveDate = this.formatDateForBackend(data.effectiveDate);
    }
    
    return preparedData;
  }

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
    const preparedData = this.prepareDataForBackend(data);
    return apiRequest<Transaction>(this.endpoint, fetchConfig('POST', preparedData));
  }

  // Atualizar transação
  async update(id: number, data: TransactionUpdateRequest): Promise<Transaction> {
    const preparedData = this.prepareDataForBackend(data);
    return apiRequest<Transaction>(`${this.endpoint}/${id}`, fetchConfig('PUT', preparedData));
  }

  // Deletar transação
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`${this.endpoint}/${id}`, fetchConfig('DELETE'));
  }
}

// Instância singleton do serviço de transações
export const transactionsService = new TransactionsService();
