/**
 * Accounts Service - Responsável apenas pelas operações de contas
 * Seguindo o princípio Single Responsibility: gerencia apenas entidade Account
 */

import { Account, AccountCreateRequest, AccountUpdateRequest } from '@/lib/types/account';
import { apiRequest, fetchConfig } from './baseService';

export class AccountsService {
  private readonly endpoint = '/accounts';

  // Listar todas as contas
  async getAll(): Promise<Account[]> {
    return apiRequest<Account[]>(this.endpoint, fetchConfig());
  }

  // Buscar conta por ID
  async getById(id: number): Promise<Account> {
    return apiRequest<Account>(`${this.endpoint}/${id}`, fetchConfig());
  }

  // Criar nova conta
  async create(data: AccountCreateRequest): Promise<Account> {
    return apiRequest<Account>(this.endpoint, fetchConfig('POST', data));
  }

  // Atualizar conta
  async update(id: number, data: AccountUpdateRequest): Promise<Account> {
    return apiRequest<Account>(`${this.endpoint}/${id}`, fetchConfig('PUT', data));
  }

  // Deletar conta
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`${this.endpoint}/${id}`, fetchConfig('DELETE'));
  }
}

// Instância singleton do serviço de contas
export const accountsService = new AccountsService();
