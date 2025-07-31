"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const router = useRouter();
  const styles = useThemeStyles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validação básica
    if (!name.trim()) {
      setError('Nome é obrigatório');
      setLoading(false);
      return;
    }

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

    try {
      await authService.register(username, email, name, password);
      
      setSuccess(true);
      
      // Faz login automaticamente após o registro
      setAutoLoggingIn(true);
      try {
        const loginData = await authService.login(username, password);
        
        if (loginData.token) {
          // Dispara evento de storage para atualizar o Header
          window.dispatchEvent(new Event('storage'));
          
          // Espera 1 segundo para mostrar o sucesso e depois redireciona
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          // Se o login automático falhar, redireciona para a página de login
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch {
        // Se o login automático falhar, redireciona para a página de login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão. Verifique sua internet e tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, 
            ${styles.bgSuccess.backgroundColor}22 0%, 
            ${styles.surface.backgroundColor}CC 100%)`
        }}
      >
        <div className="max-w-md w-full space-y-8">
          <div 
            className="p-8 rounded-lg shadow-lg text-center border"
            style={{
              ...styles.surface,
              ...styles.border
            }}
          >
            <div 
              className="text-6xl mb-4"
              style={styles.success}
            >
              ✅
            </div>
            <h2 
              className="text-2xl font-bold mb-4"
              style={styles.text}
            >
              Registro realizado com sucesso!
            </h2>
            <p 
              className="mb-4"
              style={styles.textSecondary}
            >
              {autoLoggingIn 
                ? 'Fazendo login automático...' 
                : 'Sua conta foi criada e você está sendo conectado automaticamente...'
              }
            </p>
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
              style={{ borderColor: styles.success.color }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, 
          ${styles.surface.backgroundColor}CC 0%, 
          ${styles.primary.backgroundColor}22 100%)`
      }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 
            className="text-3xl font-bold"
            style={styles.text}
          >
            Crie sua conta
          </h2>
          <p 
            className="mt-2 text-sm"
            style={styles.textSecondary}
          >
            Ou{' '}
            <Link 
              href="/login" 
              className="font-medium hover:opacity-80"
              style={{ color: styles.primary.backgroundColor }}
            >
              faça login se já tem conta
            </Link>
          </p>
        </div>

        <div 
          className="p-8 rounded-lg shadow-lg border"
          style={{
            ...styles.surface,
            ...styles.border
          }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div 
                className="border px-4 py-3 rounded"
                style={{
                  backgroundColor: '#fef2f2',
                  borderColor: '#fca5a5',
                  color: '#dc2626'
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium mb-2"
                style={styles.text}
              >
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors"
                style={{
                  ...styles.surface,
                  ...styles.border,
                  color: styles.text.color
                }}
                placeholder="Seu nome de identificação"
              />
            </div>

            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium mb-2"
                style={styles.text}
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors"
                style={{
                  ...styles.surface,
                  ...styles.border,
                  color: styles.text.color
                }}
                placeholder="Escolha um username"
              />
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={styles.text}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors"
                style={{
                  ...styles.surface,
                  ...styles.border,
                  color: styles.text.color
                }}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={styles.text}
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors"
                style={{
                  ...styles.surface,
                  ...styles.border,
                  color: styles.text.color
                }}
                placeholder="Pelo menos 6 caracteres"
              />
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium mb-2"
                style={styles.text}
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors"
                style={{
                  ...styles.surface,
                  ...styles.border,
                  color: styles.text.color
                }}
                placeholder="Digite a senha novamente"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  ...styles.button,
                  color: 'white'
                }}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p 
              className="text-sm"
              style={styles.textMuted}
            >
              Ao criar uma conta, você concorda com nossos termos de uso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
