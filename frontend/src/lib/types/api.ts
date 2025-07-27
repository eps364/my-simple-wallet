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
