/**
 * Categories Service - Responsável apenas pelas operações de categorias
 * Seguindo o princípio Single Responsibility: gerencia apenas entidade Category
 */

import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '@/lib/types/category';
import { apiRequest, fetchConfig } from './baseService';

export class CategoriesService {
  private readonly endpoint = '/categories';

  // Listar todas as categorias
  async getAll(): Promise<Category[]> {
    return apiRequest<Category[]>(this.endpoint, fetchConfig());
  }

  // Buscar categoria por ID
  async getById(id: number): Promise<Category> {
    return apiRequest<Category>(`${this.endpoint}/${id}`, fetchConfig());
  }

  // Criar nova categoria
  async create(data: CategoryCreateRequest): Promise<Category> {
    return apiRequest<Category>(this.endpoint, fetchConfig('POST', data));
  }

  // Atualizar categoria
  async update(id: number, data: CategoryUpdateRequest): Promise<Category> {
    return apiRequest<Category>(`${this.endpoint}/${id}`, fetchConfig('PUT', data));
  }

  // Deletar categoria
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`${this.endpoint}/${id}`, fetchConfig('DELETE'));
  }
}

// Instância singleton do serviço de categorias
export const categoriesService = new CategoriesService();
