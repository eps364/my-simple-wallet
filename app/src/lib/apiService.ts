import { Credentials, RegistrationData } from './types';

const API_BASE_URL = 'http://localhost:8080/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro na requisição');
  }
  
  return response.json();
}

export const loginUser = (credentials: Credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const registerUser = (userData: RegistrationData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const getUserProfile = () => apiFetch('/users/me');
