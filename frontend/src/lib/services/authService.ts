/**
 * Auth Service - Responsável apenas pela autenticação
 * Seguindo o princípio Single Responsibility: gerencia apenas operações de auth
 */

import { LoginResponse, RegisterResponse } from '@/lib/types/auth';
import { API_BASE_URL } from './baseService';

export class AuthService {
  // Login
  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('AuthService.login called with:', { username, password: password ? '[REDACTED]' : 'EMPTY' });
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Inclui cookies httpOnly
      body: JSON.stringify({ username, password })
    });

    console.log('Login response status:', response.status);
    console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Login failed with error:', errorData);
      throw new Error(errorData.message || 'Erro ao fazer login');
    }

    const result = await response.json();
    console.log('Login response body:', result);

    return { success: true };
  }

  // Logout
  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Inclui cookies httpOnly
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao fazer logout');
    }
  }

  // Registro
  async register(username: string, email: string, name: string, password: string): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Inclui cookies httpOnly
      body: JSON.stringify({ username, email, name, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao registrar usuário');
    }

    const result = await response.json();
    
    if (result.status === 201 && result.data) {
      return result.data;
    }
    
    throw new Error(result.message || 'Resposta da API inválida');
  }

  // Verificar se está autenticado fazendo uma requisição ao endpoint /me
  async isAuthenticated(): Promise<boolean> {
    try {
      console.log('Checking authentication status...');
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Inclui cookies httpOnly
      });
      
      console.log('Auth check response status:', response.status);
      console.log('Auth check response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('Auth check response body:', result);
      }
      
      const isAuth = response.ok;
      console.log('Authentication status:', isAuth);
      return isAuth;
    } catch (error) {
      // Se houver qualquer erro na requisição, consideramos não autenticado
      console.error('Auth check error:', error);
      return false;
    }
  }
}

// Instância singleton do serviço de autenticação
export const authService = new AuthService();

// Função para limpar dados de autenticação (compatibilidade com código existente)
export const clearAuthData = () => {
  authService.logout();
};
