/**
 * Base Service - Responsável pelas configurações base da API
 * Seguindo o princípio Single Responsibility: gerencia apenas a configuração base
 */

// Base URL da API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Função para obter o token do localStorage
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Configuração base para fetch
export const fetchConfig = (method: string = 'GET', body?: object): RequestInit => {
  const token = getAuthToken();
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  return config;
};

// Função genérica para fazer requests
export const apiRequest = async <T>(endpoint: string, config: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return typeof data === 'object' && data !== null && 'data' in data ? data.data : data; // Garante retorno consistente
};
