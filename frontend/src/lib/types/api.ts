// Tipo para resposta paginada do backend (Spring Page)
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  pageable?: {
    sort?: Record<string, unknown>;
    offset?: number;
    pageNumber?: number;
    pageSize?: number;
    paged?: boolean;
    unpaged?: boolean;
  };
  sort?: Record<string, unknown>;
  numberOfElements?: number;
  empty?: boolean;
}
// Tipos para as respostas da API

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Tipos para erros da API
export interface ApiError {
  status: number;
  message: string;
  error?: string;
  details?: string[];
}
