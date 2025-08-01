"use client";
import Link from 'next/link';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

export default function Home() {
  const styles = useThemeStyles();
  
  return (
    <div
      className="responsive-container mx-auto py-8 min-h-screen max-w-5xl"
      style={{
        background: `linear-gradient(135deg, 
          ${styles.surface.backgroundColor}CC 0%, 
          ${styles.primary.backgroundColor}22 100%)`
      }}
    >
      <main>
        <div className="text-center max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 pt-8">
            <h1 
              className="text-5xl font-bold mb-4"
              style={styles.text}
            >
              Simple Wallet
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={styles.textSecondary}
            >
              Gerencie suas finanças pessoais de forma simples e eficiente. 
              Controle suas contas, transações e categorias em um só lugar.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-3">
            <div 
              className="p-6 rounded-lg shadow-lg border"
              style={{
                ...styles.surface,
                ...styles.border
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#3b82f6' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={styles.text}
              >
                Gestão de Contas
              </h3>
              <p style={styles.textSecondary}>
                Organize suas contas bancárias e acompanhe seus saldos em tempo real.
              </p>
            </div>

            <div 
              className="p-6 rounded-lg shadow-lg border"
              style={{
                ...styles.surface,
                ...styles.border
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={styles.bgSuccess}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={styles.text}
              >
                Controle de Gastos
              </h3>
              <p style={styles.textSecondary}>
                Registre suas transações e categorize seus gastos para melhor controle.
              </p>
            </div>

            <div 
              className="p-6 rounded-lg shadow-lg border"
              style={{
                ...styles.surface,
                ...styles.border
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#8b5cf6' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={styles.text}
              >
                Relatórios
              </h3>
              <p style={styles.textSecondary}>
                Visualize seus dados financeiros com gráficos e relatórios detalhados.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link 
              href="/register" 
              className="font-semibold py-3 px-8 rounded-lg transition-colors text-center"
              style={{
                ...styles.button,
                display: 'inline-block'
              }}
            >
              Criar Conta Grátis
            </Link>
            <Link 
              href="/login" 
              className="font-semibold py-3 px-8 rounded-lg border transition-colors text-center"
              style={{
                ...styles.surface,
                ...styles.border,
                color: styles.text.color,
                display: 'inline-block'
              }}
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8">
        <p style={styles.textMuted}>
          &copy; 2025 Simple Wallet. Desenvolvido com Next.js e TypeScript.
        </p>
      </footer>
    </div>
  );
}
