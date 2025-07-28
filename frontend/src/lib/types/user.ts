// Tipos relacionados aos usuários

export interface User {
  id: string; // API retorna UUID como string
  username: string;
  email?: string;
  name: string; // Tornar obrigatório
  createdAt?: string;
  updatedAt?: string;
  parentId?: string | null;
  isParent?: boolean; // Indica se o usuário é parent de alguém
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  name: string; // Tornar obrigatório
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  name?: string;
  password?: string;
}

export interface PasswordUpdateRequest {
  password: string;
}

export interface ParentUpdateRequest {
  parentId: string | null;
}
