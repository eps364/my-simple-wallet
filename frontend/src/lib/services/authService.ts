/**
 * Auth Service - Responsável apenas pela autenticação
 * Seguindo o princípio Single Responsibility: gerencia apenas operações de auth
 */

import { User } from '@/lib/types/user';
import { API_BASE_URL, getAuthToken } from './baseService';

export class AuthService {
  // Login
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao fazer login');
    }

    const data = await response.json();
    
    // Salva o token no localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!getAuthToken();
  }
}

// Instância singleton do serviço de autenticação
export const authService = new AuthService();

// Função para limpar dados de autenticação (compatibilidade com código existente)
export const clearAuthData = () => {
  authService.logout();
};
