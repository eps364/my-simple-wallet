"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Iniciando processo de login...', { username });

    try {
      // Chamada para a API de autenticação usando o authService corrigido
      console.log('📡 Enviando requisição para API de login...');
      const data = await authService.login(username, password);
      
      console.log('✅ Login realizado com sucesso!', {
        tokenReceived: !!data.token,
        refreshTokenReceived: !!data.refreshToken,
        tokenType: data.tokenType,
        expiresAt: data.expiresAt,
        expiresIn: data.expiresIn
      });
      
      if (data.token) {
        console.log('💾 Dados de autenticação armazenados no localStorage');
        
        // Dispara evento de storage para atualizar o Header
        window.dispatchEvent(new Event('storage'));
        console.log('📢 Evento de storage disparado para atualizar UI');
        
        console.log('🔄 Redirecionando para dashboard...');
        router.push('/dashboard');
      } else {
        const errorMsg = 'Token não recebido da API';
        console.error('❌ Erro no login:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('💥 Erro ao fazer login:', error);
      
      // Log detalhado do erro
      if (error instanceof Error) {
        console.error('📋 Detalhes do erro:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão. Verifique sua internet e tente novamente.';
      console.error('🚨 Mensagem de erro para usuário:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Processo de login finalizado');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Faça login na sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Ou{' '}
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              volte para a página inicial
            </Link>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Seu username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Sua senha"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Digite suas credenciais para acessar sua conta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
