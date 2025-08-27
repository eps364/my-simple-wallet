/**
 * Transactions Service - Responsável apenas pelas operações de transações
 * Seguindo o princípio Single Responsibility: gerencia apenas entidade Transaction
 */

import {
  Transaction,
  TransactionCreateRequest,
  TransactionUpdateRequest,
} from "@/lib/types/transaction";
import { apiRequest, fetchConfig } from "./baseService";
import { PaginatedResponse } from "@/lib/types/api";
import { TransactionFilters } from "@/lib/types/transaction";

interface BatchTransactionRequest {
  transaction: TransactionCreateRequest;
  qtdeInstallments: number;
}
export class TransactionsService {
  private readonly endpoint = "/transactions";

  // Converter data de YYYY-MM-DD para DD/MM/YYYY
  private formatDateForBackend(date: string): string {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  // Preparar dados para envio ao backend
  private prepareDataForBackend(
    data: TransactionCreateRequest | TransactionUpdateRequest
  ): TransactionCreateRequest | TransactionUpdateRequest {
    const preparedData = { ...data };

    if ("dueDate" in data && data.dueDate) {
      preparedData.dueDate = this.formatDateForBackend(data.dueDate);
    }

    if ("effectiveDate" in data && data.effectiveDate) {
      preparedData.effectiveDate = this.formatDateForBackend(
        data.effectiveDate
      );
    }
    console.log("Prepared data:", preparedData); // Debugging purposes
    return preparedData;
  }

  // Listar todas as transações
  async getAll(isParent?: boolean): Promise<PaginatedResponse<Transaction>> {
    const params = isParent ? "?isParent=true" : "";
    return apiRequest<PaginatedResponse<Transaction>>(
      `${this.endpoint}${params}`,
      fetchConfig()
    );
  }

  // Consultar transações com filtros e paginação
  async getFiltered(filters: TransactionFilters, page: number = 0, size: number = 20, isParent?: boolean): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (filters.accountId) params.append('accountId', String(filters.accountId));
    if (filters.categoryId) params.append('categoryId', String(filters.categoryId));
    if (filters.type !== undefined) params.append('type', String(filters.type));
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.description) params.append('description', filters.description);
    if (filters.username) params.append('username', filters.username);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.dateType) params.append('dateType', filters.dateType); // Add dateType filter
    params.append('page', String(page));
    params.append('size', String(size));
    if (isParent) params.append('isParent', 'true');
    return apiRequest<PaginatedResponse<Transaction>>(
      `${this.endpoint}?${params.toString()}`,
      fetchConfig()
    );
  }

  // Buscar transação por ID
  async getById(id: number): Promise<Transaction> {
    return apiRequest<Transaction>(`${this.endpoint}/${id}`, fetchConfig());
  }

  // Criar nova transação
  async create(data: TransactionCreateRequest): Promise<Transaction> {
    const preparedData = this.prepareDataForBackend(data);
    return apiRequest<Transaction>(
      this.endpoint,
      fetchConfig("POST", preparedData)
    );
  }

  // Atualizar transação
  async update(
    id: number,
    data: TransactionUpdateRequest
  ): Promise<Transaction> {
    const preparedData = this.prepareDataForBackend(data);
    return apiRequest<Transaction>(
      `${this.endpoint}/${id}`,
      fetchConfig("PUT", preparedData)
    );
  }

  // Deletar transação
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`${this.endpoint}/${id}`, fetchConfig("DELETE"));
  }

  // Liquidar transação (settle)
  async settle(
    id: number,
    data: { effectiveDate: string; effectiveAmount: number }
  ): Promise<Transaction> {
    const preparedData = {
      effectiveDate: this.formatDateForBackend(data.effectiveDate),
      effectiveAmount: data.effectiveAmount,
    };
    return apiRequest<Transaction>(
      `${this.endpoint}/${id}/effective`,
      fetchConfig("PATCH", preparedData)
    );
  }

  async createBatch(data: BatchTransactionRequest): Promise<Transaction[]> {
    const preparedTransaction = this.prepareDataForBackend(data.transaction);
    const preparedData = {
      ...preparedTransaction,
      qtdeInstallments: data.qtdeInstallments,
    };
    console.log("Prepared batch data:", preparedData); // Para depuração
    return apiRequest<Transaction[]>(
      `${this.endpoint}/batch`,
      fetchConfig("POST", preparedData)
    );
  }
}

// Instância singleton do serviço de transações
export const transactionsService = new TransactionsService();
