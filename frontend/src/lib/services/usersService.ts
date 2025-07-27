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

  // Buscar usuário por ID
  async getUserById(id: string): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/${id}`, fetchConfig());
  }

  // Atualizar perfil do usuário (username e email)
  async updateProfile(data: UserUpdateRequest): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me`, fetchConfig('PUT', data));
  }

  // Alterar senha do usuário
  async updatePassword(password: string): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me/password`, fetchConfig('PATCH', { password }));
  }

  // Buscar usuários filhos (onde eu sou parent)
  async getChildren(): Promise<User[]> {
    return apiRequest<User[]>(`${this.endpoint}/me/parent`, fetchConfig());
  }

  // Adicionar/atualizar parent na conta atual
  async updateParent(parentId: string): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me/parent`, fetchConfig('PATCH', { parentId }));
  }

  // Remover parent da conta atual
  async removeParent(): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me/parent`, fetchConfig('PATCH', { parentId: null }));
  }

  // Criar novo usuário (registro)
  async create(data: UserCreateRequest): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/register`, fetchConfig('POST', data));
  }
}
  
// Instância singleton do serviço de usuários
export const usersService = new UsersService();
