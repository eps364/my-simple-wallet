// Tipos relacionados à autenticação

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number; // Tempo de expiração em segundos
  expiresAt: string; // Data/hora de expiração ISO string
  tokenType: string; // "Bearer"
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
