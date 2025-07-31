"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';
import { FormField } from '@/components/ui/FormComponents';
import { FormFeedback } from '@/components/ui/FormFeedback';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const styles = useThemeStyles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Chamada para a API de autenticação usando o authService corrigido
      const data = await authService.login(username, password);
      
      if (data.token) {
        // Dispara evento de storage para atualizar o Header
        window.dispatchEvent(new Event('storage'));
        
        router.push('/dashboard');
      } else {
        const errorMsg = 'Token não recebido da API';
        setError(errorMsg);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão. Verifique sua internet e tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            Faça login na sua conta
          </h2>
          <p 
            className="mt-2 text-sm"
            style={styles.textSecondary}
          >
            Não tem conta?{' '}
            <Link 
              href="/register" 
              className="font-medium hover:opacity-80"
              style={{ color: styles.primary.backgroundColor }}
            >
              Criar conta
            </Link>
            {' '}ou{' '}
            <Link 
              href="/" 
              className="font-medium hover:opacity-80"
              style={{ color: styles.primary.backgroundColor }}
            >
              voltar para a página inicial
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
            {error && <FormFeedback message={error} type="error" />}

            <FormField
              label="Username"
              name="username"
              type="text"
              value={username}
              onChange={setUsername}
              required
              placeholder="Seu username"
            />

            <FormField
              label="Senha"
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              placeholder="Sua senha"
            />

            <SubmitButton label="Entrar" loading={loading} />
          </form>

          <div className="mt-6 text-center">
            <p 
              className="text-sm"
              style={styles.textMuted}
            >
              Digite suas credenciais para acessar sua conta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
