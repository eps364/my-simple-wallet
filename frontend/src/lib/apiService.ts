/**
 * API Service - Redirecionamento para os novos serviços modulares
 * Este arquivo mantém compatibilidade com o código existente
 * Os serviços foram refatorados seguindo princípios SOLID em /lib/services/
 */

// Re-exportar tudo dos serviços modulares
export * from './services';

// Manter compatibilidade com importações antigas
export {
  authApi,
  accountsApi,
  categoriesApi,
  transactionsApi,
  usersApi,
  clearAuthData
} from './services';
