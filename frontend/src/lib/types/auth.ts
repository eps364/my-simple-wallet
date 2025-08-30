// Tipos relacionados à autenticação

export interface LoginResponse {
  success: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  parentId: string | null;
}
