const API_BASE_URL = 'http://localhost:8080/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'API Error');
  }

  return responseData;
}

export const loginUser = (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const registerUser = (userData: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const getUserProfile = () => apiFetch('/users/me');
