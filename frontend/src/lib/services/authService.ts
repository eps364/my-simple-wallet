/**
 * Auth Service - Responsável apenas pela autenticação
 * Seguindo o princípio Single Responsibility: gerencia apenas operações de auth
 */

import { LoginResponse } from '@/lib/types/auth';
import { API_BASE_URL, getAuthToken } from './baseService';

export class AuthService {
  // Login
  async login(username: string, password: string): Promise<LoginResponse> {
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

    const result = await response.json();
    
    // Verifica se a resposta tem a estrutura esperada da API
    if (result.status === 200 && result.data?.token) {
      // Salva os dados de autenticação no localStorage
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      localStorage.setItem('tokenType', result.data.tokenType);
      localStorage.setItem('expiresAt', result.data.expiresAt);
      
      return result.data; // Retorna apenas o objeto data
    }
    
    // Se não tem a estrutura esperada, lança erro
    throw new Error(result.message || 'Resposta da API inválida');
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresAt');
    // Remove o cookie também
    if (typeof document !== 'undefined') {
      document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    }
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
