'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, getUserProfile } from '@/lib/apiService';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('=== LOGIN DEBUG ===');
      console.log('Username:', username);
      console.log('Password:', password ? '[REDACTED]' : 'EMPTY');

      // Fazer login
      const loginResponse = await loginUser({ username, password });
      console.log('Login response:', loginResponse);
      
      // Verificar se o login foi bem-sucedido
      if (loginResponse.status === 200) {
        console.log('Login successful, testing authentication...');
        
        // Testar se conseguimos acessar o perfil do usuário (validar o cookie)
        try {
          const userProfile = await getUserProfile();
          console.log('User profile retrieved:', userProfile);
          
          // Se conseguimos obter o perfil, significa que estamos autenticados
          login(); // Atualizar o estado de autenticação no contexto
          
          console.log('Authentication confirmed, redirecting to dashboard...');
          router.push('/dashboard');
        } catch (profileError) {
          console.error('Failed to get user profile after login:', profileError);
          setError('Login realizado, mas falha na verificação. Tente novamente.');
        }
      } else {
        setError('Credenciais inválidas');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        className="p-8 bg-white rounded-lg shadow-md dark:bg-gray-800 w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Login</h2>
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 text-gray-900 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-gray-900 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
