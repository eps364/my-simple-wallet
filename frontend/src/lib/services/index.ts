/**
 * Services Index - Ponto central de exportação dos serviços
 * Seguindo o princípio Open/Closed: facilita extensão sem modificar código existente
 * Seguindo o princípio Dependency Inversion: abstrai implementações específicas
 */

import { AccountCreateRequest, AccountUpdateRequest } from '@/lib/types/account';
import { CategoryCreateRequest, CategoryUpdateRequest } from '@/lib/types/category';
import { TransactionCreateRequest, TransactionUpdateRequest } from '@/lib/types/transaction';
import { UserCreateRequest, UserUpdateRequest } from '@/lib/types/user';

// Importar os serviços individuais
import { authService } from './authService';
import { accountsService } from './accountsService';
import { categoriesService } from './categoriesService';
import { transactionsService } from './transactionsService';
import { usersService } from './usersService';

// Serviços individuais (Instâncias Singleton)
export { authService, clearAuthData } from './authService';
export { accountsService } from './accountsService';
export { categoriesService } from './categoriesService';
export { transactionsService } from './transactionsService';
export { usersService } from './usersService';

// Exportações para compatibilidade com código existente
export const authApi = {
  login: (username: string, password: string) => authService.login(username, password),
  logout: () => authService.logout(),
  isAuthenticated: () => authService.isAuthenticated()
};

export const accountsApi = {
  getAll: () => accountsService.getAll(),
  getById: (id: number) => accountsService.getById(id),
  create: (data: AccountCreateRequest) => accountsService.create(data),
  update: (id: number, data: AccountUpdateRequest) => accountsService.update(id, data),
  delete: (id: number) => accountsService.delete(id)
};

export const categoriesApi = {
  getAll: () => categoriesService.getAll(),
  getById: (id: number) => categoriesService.getById(id),
  create: (data: CategoryCreateRequest) => categoriesService.create(data),
  update: (id: number, data: CategoryUpdateRequest) => categoriesService.update(id, data),
  delete: (id: number) => categoriesService.delete(id)
};

export const transactionsApi = {
  getAll: () => transactionsService.getAll(),
  getById: (id: number) => transactionsService.getById(id),
  create: (data: TransactionCreateRequest) => transactionsService.create(data),
  update: (id: number, data: TransactionUpdateRequest) => transactionsService.update(id, data),
  delete: (id: number) => transactionsService.delete(id)
};

export const usersApi = {
  getProfile: () => usersService.getProfile(),
  updateProfile: (data: UserUpdateRequest) => usersService.updateProfile(data),
  create: (data: UserCreateRequest) => usersService.create(data)
};

// Exportações base para casos avançados
export { API_BASE_URL, getAuthToken, fetchConfig, apiRequest } from './baseService';
