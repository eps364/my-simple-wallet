"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validação básica
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    console.log('📝 Iniciando processo de registro...', { username, email });

    try {
      console.log('📡 Enviando requisição para API de registro...');
      const data = await authService.register(username, email, password);
      
      console.log('✅ Registro realizado com sucesso!', {
        userId: data.id,
        username: data.username,
        email: data.email
      });
      
      setSuccess(true);
      
      // Faz login automaticamente após o registro
      console.log('🔐 Fazendo login automático após registro...');
      setAutoLoggingIn(true);
      try {
        const loginData = await authService.login(username, password);
        
        console.log('✅ Login automático realizado com sucesso!', {
          tokenReceived: !!loginData.token,
          refreshTokenReceived: !!loginData.refreshToken,
          tokenType: loginData.tokenType,
          expiresAt: loginData.expiresAt,
          expiresIn: loginData.expiresIn
        });
        
        if (loginData.token) {
          console.log('💾 Dados de autenticação armazenados no localStorage');
          
          // Dispara evento de storage para atualizar o Header
          window.dispatchEvent(new Event('storage'));
          console.log('📢 Evento de storage disparado para atualizar UI');
          
          // Espera 1 segundo para mostrar o sucesso e depois redireciona
          setTimeout(() => {
            console.log('🔄 Redirecionando para dashboard...');
            router.push('/dashboard');
          }, 1000);
        } else {
          // Se o login automático falhar, redireciona para a página de login
          setTimeout(() => {
            console.log('🔄 Login automático falhou, redirecionando para página de login...');
            router.push('/login');
          }, 2000);
        }
      } catch (loginError) {
        console.error('💥 Erro no login automático:', loginError);
        // Se o login automático falhar, redireciona para a página de login
        setTimeout(() => {
          console.log('🔄 Login automático falhou, redirecionando para página de login...');
          router.push('/login');
        }, 2000);
      }
      
    } catch (error) {
      console.error('💥 Erro ao fazer registro:', error);
      
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
      console.log('🏁 Processo de registro finalizado');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Registro realizado com sucesso!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {autoLoggingIn 
                ? 'Fazendo login automático...' 
                : 'Sua conta foi criada e você está sendo conectado automaticamente...'
              }
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Ou{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              faça login se já tem conta
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
                placeholder="Escolha um username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="seu@email.com"
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
                placeholder="Pelo menos 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Digite a senha novamente"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ao criar uma conta, você concorda com nossos termos de uso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
