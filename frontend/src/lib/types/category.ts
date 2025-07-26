// Tipos relacionados às categorias

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
  color?: string;
}

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
