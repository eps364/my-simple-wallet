// Tipos relacionados aos usuários

export interface User {
  id: string; // API retorna UUID como string
  username: string;
  email?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  parentId?: string | null;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  name?: string;
}

export interface PasswordUpdateRequest {
  password: string;
}

export interface ParentUpdateRequest {
  parentId: string | null;
}
