// Tipos relacionados às categorias

export interface Category {
  id: number;
  category: string;
  type: CategoryType;
  color?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreateRequest {
  category: string;
  type: number; // 0 para IN, 1 para OUT
  color?: string;
}

export interface CategoryUpdateRequest {
  category?: string;
  type?: number;
  color?: string;
}

// Enum para tipos de categoria
export enum CategoryType {
  IN = 'IN',
  EX = 'EX'
}

// Mapeamento dos números para os tipos
export const CATEGORY_TYPE_MAP = {
  0: CategoryType.IN,
  1: CategoryType.EX
} as const;

export const CATEGORY_TYPE_REVERSE_MAP = {
  [CategoryType.IN]: 0,
  [CategoryType.EX]: 1
} as const;

// Cores predefinidas para categorias
export const CATEGORY_COLORS = [
  '#FF6B6B', // Vermelho
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul
  '#96CEB4', // Verde
  '#FFEAA7', // Amarelo
  '#DDA0DD', // Roxo
  '#98D8C8', // Verde claro
  '#F7DC6F', // Dourado
  '#BB8FCE', // Lavanda
  '#85C1E9', // Azul claro
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number];
