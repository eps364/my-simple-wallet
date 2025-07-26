// Tipos relacionados aos usuários

export interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface UserUpdateRequest {
  email?: string;
  name?: string;
  password?: string;
}
