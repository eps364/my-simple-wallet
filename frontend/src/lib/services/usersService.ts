/**
 * Users Service - Responsável apenas pelas operações de usuários
 * Seguindo o princípio Single Responsibility: gerencia apenas entidade User
 */

import { User, UserCreateRequest, UserUpdateRequest } from '@/lib/types/user';
import { apiRequest, fetchConfig } from './baseService';

export class UsersService {
  private readonly endpoint = '/users';

  // Buscar usuário atual (perfil)
  async getProfile(): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me`, fetchConfig());
  }

  // Atualizar perfil do usuário
  async updateProfile(data: UserUpdateRequest): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/profile`, fetchConfig('PUT', data));
  }

  // Criar novo usuário (registro)
  async create(data: UserCreateRequest): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/register`, fetchConfig('POST', data));
  }
}

// Instância singleton do serviço de usuários
export const usersService = new UsersService();
