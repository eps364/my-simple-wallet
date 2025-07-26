import { ApiResponse, LoginResponse, ApiError } from './types';

// Configuração da API
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  endpoints: {
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
    },
    users: '/api/users',
    accounts: '/api/accounts',
    transactions: '/api/transactions',
    categories: '/api/categories',
  },
} as const;

// Interface para gerenciamento de tokens (Single Responsibility Principle)
interface TokenManager {
  isExpired(): boolean;
  clear(): void;
  store(data: LoginResponse): void;
  get(): string | null;
  getRefreshToken(): string | null;
  getTokenType(): string;
}

// Implementação do gerenciador de tokens
class LocalStorageTokenManager implements TokenManager {
  isExpired(): boolean {
    if (typeof window === 'undefined') {
      console.log('⚠️ TokenManager: Window não disponível, considerando token como expirado');
      return true;
    }
    
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) {
      console.log('⚠️ TokenManager: Nenhuma data de expiração encontrada');
      return true;
    }
    
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    
    // Verifica se o token expira nos próximos 1 minuto (margem de segurança reduzida)
    const oneMinuteFromNow = new Date(now.getTime() + 1 * 60 * 1000);
    
    const isExpired = expirationDate <= oneMinuteFromNow;
    
    console.log('🕐 TokenManager: Verificação de expiração', {
      expiresAt,
      expirationDate: expirationDate.toISOString(),
      now: now.toISOString(),
      oneMinuteFromNow: oneMinuteFromNow.toISOString(),
      isExpired,
      timeUntilExpiry: `${Math.round((expirationDate.getTime() - now.getTime()) / 1000 / 60)} minutos`
    });
    
    return isExpired;
  }

  clear(): void {
    if (typeof window === 'undefined') {
      console.warn('⚠️ TokenManager: Window não disponível, não é possível limpar dados');
      return;
    }
    
    console.log('🧹 TokenManager: Limpando dados de autenticação...');
    
    // Verifica se havia dados antes de limpar
    const hadToken = !!localStorage.getItem('token');
    console.log('📋 TokenManager: Estado antes da limpeza:', {
      hadToken,
      hadRefreshToken: !!localStorage.getItem('refreshToken'),
      hadTokenType: !!localStorage.getItem('tokenType'),
      hadExpiresAt: !!localStorage.getItem('expiresAt')
    });
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresAt');
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    
    console.log('✅ TokenManager: Dados de autenticação limpos', { previouslyHadToken: hadToken });
  }

  store(data: LoginResponse): void {
    if (typeof window === 'undefined') {
      console.warn('⚠️ TokenManager: Window não disponível, não é possível armazenar dados');
      return;
    }

    console.log('💾 TokenManager: Iniciando armazenamento de dados de autenticação...');
    
    const { token, refreshToken, expiresIn, expiresAt, tokenType } = data;
    
    console.log('📋 TokenManager: Dados a serem armazenados:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      tokenType,
      expiresIn,
      expiresAt
    });
    
    // Armazena no localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('tokenType', tokenType);
    localStorage.setItem('expiresAt', expiresAt);
    
    console.log('✅ TokenManager: Dados salvos no localStorage');
    
    // Calcula a data de expiração para o cookie
    const expires = new Date();
    expires.setTime(expires.getTime() + (expiresIn * 1000));
    
    // Define cookie para o middleware
    document.cookie = `token=${token};expires=${expires.toUTCString()};path=/`;
    
    console.log('🍪 TokenManager: Cookie configurado', {
      expires: expires.toUTCString(),
      tokenLength: token.length
    });
  }

  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  getTokenType(): string {
    if (typeof window === 'undefined') return 'Bearer';
    return localStorage.getItem('tokenType') || 'Bearer';
  }
}

// Instância singleton do gerenciador de tokens
const tokenManager = new LocalStorageTokenManager();

// Funções utilitárias para manter compatibilidade (Delegation Pattern)
export function isTokenExpired(): boolean {
  return tokenManager.isExpired();
}

export function clearAuthData(): void {
  tokenManager.clear();
}

// Interface para serviços de autenticação (Dependency Inversion Principle)
interface AuthService {
  refreshToken(): Promise<boolean>;
  login(username: string, password: string): Promise<LoginResponse>;
}

// Implementação do serviço de autenticação
class ApiAuthService implements AuthService {
  constructor(private readonly tokenManager: TokenManager) {}

  async refreshToken(): Promise<boolean> {
    console.log('🔄 AuthService: Iniciando renovação de token...');
    
    const refreshTokenValue = this.tokenManager.getRefreshToken();
    if (!refreshTokenValue) {
      console.warn('⚠️ AuthService: Nenhum refresh token disponível');
      return false;
    }
    
    console.log('📋 AuthService: Refresh token encontrado', {
      tokenLength: refreshTokenValue.length
    });
    
    try {
      console.log('📡 AuthService: Enviando requisição de refresh...');
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });
      
      console.log('📥 AuthService: Resposta de refresh recebida', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const result: ApiResponse<LoginResponse> = await response.json();
        console.log('📊 AuthService: Dados de refresh:', result);
        
        if (result.status === 200 && result.data?.token) {
          console.log('✅ AuthService: Refresh bem-sucedido, armazenando novos dados...');
          this.tokenManager.store(result.data);
          console.log('🔄 AuthService: Token renovado com sucesso:', result.message);
          return true;
        } else {
          console.error('❌ AuthService: Resposta de refresh inválida:', result);
        }
      } else {
        console.error('❌ AuthService: Erro HTTP no refresh:', response.status, response.statusText);
        
        // Tenta pegar detalhes do erro
        try {
          const errorData = await response.json();
          console.error('📋 AuthService: Detalhes do erro:', errorData);
        } catch {
          console.error('📋 AuthService: Não foi possível parsear erro como JSON');
        }
      }
      
      console.error('❌ AuthService: Falha no refresh, limpando dados');
      this.tokenManager.clear();
      return false;
    } catch (error) {
      console.error('💥 AuthService: Erro ao renovar token:', error);
      this.tokenManager.clear();
      return false;
    }
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('🔗 ApiAuthService: Iniciando login para usuário:', username);
    
    try {
      const response = await apiRequest(API_CONFIG.endpoints.auth.login, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      console.log('📥 ApiAuthService: Resposta recebida', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        console.error('❌ ApiAuthService: Resposta não OK', response.status);
        
        const errorData: ApiError = await response.json().catch(() => ({ 
          status: response.status, 
          message: 'Erro ao fazer login' 
        }));
        
        console.error('📋 ApiAuthService: Dados de erro da API:', errorData);
        const errorMessage = errorData.message || 'Erro ao fazer login';
        throw new Error(errorMessage);
      }

      const result: ApiResponse<LoginResponse> = await response.json();
      
      // Log da mensagem da API no console
      console.log('✅ ApiAuthService: Resposta da API:', result.message);
      console.log('📊 ApiAuthService: Dados completos:', result);
      
      // Verifica se a resposta tem a estrutura esperada da sua API
      if (result.status === 200 && result.data?.token) {
        console.log('💾 ApiAuthService: Armazenando dados de autenticação...');
        this.tokenManager.store(result.data);
        console.log('✅ ApiAuthService: Dados armazenados com sucesso');
        return result.data; // Retorna apenas o objeto data com o token
      }
      
      // Se não tem a estrutura esperada, lança erro
      console.error('❌ ApiAuthService: Estrutura de resposta inválida:', result);
      throw new Error('Resposta da API inválida');
    } catch (error) {
      console.error('💥 ApiAuthService: Erro durante o login:', error);
      throw error; // Re-propaga o erro para ser tratado na UI
    }
  }
}

// Instância singleton do serviço de autenticação
const authService = new ApiAuthService(tokenManager);

// Função para manter compatibilidade
export async function refreshToken(): Promise<boolean> {
  return authService.refreshToken();
}

// Função auxiliar para verificar e renovar token se necessário
async function handleTokenValidation(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const hasToken = !!tokenManager.get();
  const hasRefreshToken = !!tokenManager.getRefreshToken();
  
  console.log('🔍 ApiRequest: Estado da autenticação', {
    hasToken,
    hasRefreshToken,
    isExpired: hasToken ? tokenManager.isExpired() : 'N/A'
  });
  
  // Só tenta renovar se houver um refresh token e o token atual estiver expirado
  if (hasToken && hasRefreshToken && tokenManager.isExpired()) {
    console.log('⏰ ApiRequest: Token expirado, tentando renovar...');
    const refreshed = await authService.refreshToken();
    if (!refreshed) {
      console.error('❌ ApiRequest: Falha ao renovar token, redirecionando para login');
      window.location.href = '/login';
      throw new Error('Token expirado');
    }
    console.log('✅ ApiRequest: Token renovado com sucesso');
  }
}

// Função auxiliar para configurar headers de autenticação
function setupAuthHeaders(defaultHeaders: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  
  const token = tokenManager.get();
  const tokenType = tokenManager.getTokenType();
  if (token) {
    defaultHeaders['Authorization'] = `${tokenType} ${token}`;
    console.log('🔑 ApiRequest: Token adicionado ao header', {
      tokenType,
      tokenLength: token.length
    });
  } else {
    console.log('⚠️ ApiRequest: Nenhum token disponível');
  }
}

// Função helper para fazer requisições à API (Open/Closed Principle)
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  console.log('🌐 ApiRequest: Iniciando requisição', {
    endpoint,
    url,
    method: options.method || 'GET'
  });
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Verifica e renova token se necessário
  await handleTokenValidation();
  
  // Configura headers de autenticação
  setupAuthHeaders(defaultHeaders);

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log('📡 ApiRequest: Enviando requisição...');
    const response = await fetch(url, config);
    
    console.log('📥 ApiRequest: Resposta recebida', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    // Se token expirou mesmo após tentativa de refresh, redireciona para login
    if (response.status === 401) {
      console.error('🚫 ApiRequest: Token inválido (401), limpando dados e redirecionando');
      if (typeof window !== 'undefined') {
        tokenManager.clear();
        window.location.href = '/login';
      }
      throw new Error('Token expirado');
    }

    return response;
  } catch (error) {
    console.error('💥 ApiRequest: Erro na requisição:', error);
    throw error;
  }
}

// Função específica para login (mantém compatibilidade com código existente)
export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  return authService.login(username, password);
}
