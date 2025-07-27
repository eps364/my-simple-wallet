"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/lib/services/usersService';
import { User } from '@/lib/types/user';
import { LoadingSpinner, QRCodeGenerator, QRCodeReader } from '@/components/ui';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

export default function ManageAccountsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para modais
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showRemoveChildModal, setShowRemoveChildModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<User | null>(null);
  
  // Estados para adicionar filho
  const [childId, setChildId] = useState('');
  const [useQRScanner, setUseQRScanner] = useState(false);
  
  const router = useRouter();
  const styles = useThemeStyles();

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [userProfile, userChildren] = await Promise.all([
        usersService.getProfile(),
        usersService.getChildren().catch(() => [])
      ]);
      
      setUser(userProfile);
      setChildren(userChildren);
    } catch {
      setError('Erro ao carregar dados das contas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
    try {
      setError('');
      await usersService.addChild(childId);
      
      setShowAddChildModal(false);
      setChildId('');
      setUseQRScanner(false);
      setSuccess('Conta adicionada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Recarregar dados
      await loadAccountData();
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar conta');
    }
  };

  const handleRemoveChild = async () => {
    if (!selectedChild) return;
    
    try {
      setError('');
      await usersService.removeChild(selectedChild.id);
      
      setShowRemoveChildModal(false);
      setSelectedChild(null);
      setSuccess('Conta removida com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Recarregar dados
      await loadAccountData();
    } catch (error: any) {
      setError(error.message || 'Erro ao remover conta');
    }
  };

  const handleQRScan = (scannedId: string) => {
    setChildId(scannedId);
    setUseQRScanner(false);
    setSuccess('QR Code lido com sucesso! Verifique o ID e confirme.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleQRError = (error: string) => {
    setError(error);
    setTimeout(() => setError(''), 3000);
  };

  if (loading) {
    return (
      <div 
        style={{ 
          backgroundColor: styles.background.backgroundColor,
          minHeight: '100vh',
          paddingTop: '80px'
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        style={{ 
          backgroundColor: styles.background.backgroundColor,
          minHeight: '100vh',
          paddingTop: '80px'
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p 
              style={{ color: 'var(--color-error)' }}
              className="text-center"
            >
              Erro ao carregar dados do usuário
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
              className="mt-4 px-4 py-2 rounded-lg transition-all"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        backgroundColor: styles.background.backgroundColor,
        minHeight: '100vh',
        paddingTop: '80px'
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            style={{ color: styles.text.color }}
            className="text-3xl font-bold"
          >
            Gerenciador de Contas
          </h1>
          <p 
            style={{ color: styles.textSecondary.color }}
            className="mt-2"
          >
            Gerencie as contas vinculadas à sua conta principal
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div 
            style={{
              backgroundColor: 'var(--color-error)',
              borderColor: 'var(--color-error)',
              color: 'white',
              opacity: 0.9
            }}
            className="mb-6 border px-4 py-3 rounded-lg"
          >
            {error}
          </div>
        )}
        
        {success && (
          <div 
            style={{
              backgroundColor: 'var(--color-success)',
              borderColor: 'var(--color-success)',
              color: 'white',
              opacity: 0.9
            }}
            className="mb-6 border px-4 py-3 rounded-lg"
          >
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações da Conta Principal */}
          <div 
            style={{
              ...styles.surface,
              borderColor: styles.border.borderColor,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="rounded-lg border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 
                style={{ color: styles.text.color }}
                className="text-xl font-semibold"
              >
                Conta Principal
              </h2>
              <button
                onClick={() => router.push('/profile')}
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: 'white'
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Perfil
              </button>
            </div>

            <div className="flex gap-6">
              {/* QR Code na esquerda */}
              <div className="flex-shrink-0">
                <QRCodeGenerator 
                  value={user.id} 
                  size={120}
                  className=""
                />
              </div>
              
              {/* Informações do usuário na direita */}
              <div className="flex-1 space-y-4">
                <div>
                  <span 
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-1"
                  >
                    Nome
                  </span>
                  <p 
                    style={{ color: styles.text.color }}
                    className="font-medium"
                  >
                    {user.name || 'Não informado'}
                  </p>
                </div>

                <div>
                  <span 
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-1"
                  >
                    Username
                  </span>
                  <p 
                    style={{ color: styles.text.color }}
                    className="font-medium"
                  >
                    {user.username}
                  </p>
                </div>

                <div>
                  <span 
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-1"
                  >
                    Email
                  </span>
                  <p 
                    style={{ color: styles.text.color }}
                  >
                    {user.email || 'Não informado'}
                  </p>
                </div>

                <div>
                  <span 
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-1"
                  >
                    Status
                  </span>
                  <span 
                    style={{ 
                      color: user.isParent ? 'var(--color-success)' : 'var(--color-primary)',
                      backgroundColor: user.isParent ? 'var(--color-success)' + '20' : 'var(--color-primary)' + '20'
                    }}
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {user.isParent ? 'Conta Principal' : 'Conta Vinculada'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contas Gerenciadas */}
          <div 
            style={{
              ...styles.surface,
              borderColor: styles.border.borderColor,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="rounded-lg border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 
                style={{ color: styles.text.color }}
                className="text-xl font-semibold"
              >
                Contas Gerenciadas ({children.length})
              </h2>
              {user.isParent && (
                <button
                  onClick={() => setShowAddChildModal(true)}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Adicionar
                </button>
              )}
            </div>

            {children.length === 0 ? (
              <div className="text-center py-8">
                <svg 
                  style={{ color: styles.textMuted.color }}
                  className="w-12 h-12 mx-auto mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p 
                  style={{ color: styles.textMuted.color }}
                  className="mb-4"
                >
                  {user.isParent 
                    ? 'Você não possui contas gerenciadas' 
                    : 'Apenas contas principais podem gerenciar outras contas'
                  }
                </p>
                {!user.isParent && (
                  <p 
                    style={{ color: styles.textSecondary.color }}
                    className="text-sm"
                  >
                    Sua conta está vinculada a outra conta principal
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    style={{
                      backgroundColor: styles.background.backgroundColor,
                      borderColor: styles.border.borderColor,
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    className="flex items-center justify-between p-4 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          {(child.name || child.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p 
                            style={{ color: styles.text.color }}
                            className="font-medium"
                          >
                            {child.name || child.username}
                          </p>
                          <p 
                            style={{ color: styles.textSecondary.color }}
                            className="text-sm"
                          >
                            {child.email || 'Email não informado'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p 
                        style={{ color: styles.textMuted.color }}
                        className="text-xs font-mono"
                      >
                        {child.id.substring(0, 8)}...
                      </p>
                      <button
                        onClick={() => {
                          setSelectedChild(child);
                          setShowRemoveChildModal(true);
                        }}
                        style={{ color: 'var(--color-error)' }}
                        className="p-1 transition-colors"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Adicionar Conta */}
        {showAddChildModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div 
              style={{
                ...styles.surface,
                borderColor: styles.border.borderColor,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              className="rounded-lg max-w-md w-full p-6"
            >
              <h3 
                style={{ color: styles.text.color }}
                className="text-lg font-semibold mb-4"
              >
                Adicionar Conta Gerenciada
              </h3>
              
              {/* Toggle entre input manual e QR scanner */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUseQRScanner(false)}
                  style={{
                    backgroundColor: !useQRScanner 
                      ? 'var(--color-primary)' 
                      : 'var(--color-surface)',
                    borderColor: !useQRScanner 
                      ? 'var(--color-primary)' 
                      : 'var(--color-border)',
                    color: !useQRScanner 
                      ? 'white' 
                      : styles.text.color,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
                >
                  Digite o ID
                </button>
                <button
                  type="button"
                  onClick={() => setUseQRScanner(true)}
                  style={{
                    backgroundColor: useQRScanner 
                      ? 'var(--color-primary)' 
                      : 'var(--color-surface)',
                    borderColor: useQRScanner 
                      ? 'var(--color-primary)' 
                      : 'var(--color-border)',
                    color: useQRScanner 
                      ? 'white' 
                      : styles.text.color,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
                >
                  Escanear QR
                </button>
              </div>

              {useQRScanner ? (
                <div className="space-y-4">
                  <p 
                    style={{ color: styles.textSecondary.color }}
                    className="text-sm"
                  >
                    Aponte a câmera para o QR code da conta:
                  </p>
                  <QRCodeReader
                    onScan={handleQRScan}
                    onError={handleQRError}
                    isActive={useQRScanner}
                    className="w-full"
                  />
                  {childId && (
                    <div 
                      style={{ 
                        backgroundColor: 'var(--color-success)',
                        opacity: 0.1
                      }}
                      className="p-3 rounded-lg"
                    >
                      <p 
                        style={{ color: 'var(--color-success)' }}
                        className="text-sm"
                      >
                        ID detectado: <span className="font-mono">{childId}</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleAddChild(); }}>
                  <div>
                    <label 
                      htmlFor="child-id" 
                      style={{ color: styles.textSecondary.color }}
                      className="block text-sm font-medium mb-2"
                    >
                      ID da Conta
                    </label>
                    <input
                      id="child-id"
                      type="text"
                      value={childId}
                      onChange={(e) => setChildId(e.target.value)}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      className="w-full px-3 py-2 rounded-md transition-all focus:outline-none"
                      placeholder="Digite o ID da conta a ser gerenciada"
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  
                  <button type="submit" className="hidden" />
                </form>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChildModal(false);
                    setUseQRScanner(false);
                    setChildId('');
                  }}
                  style={{ color: styles.textSecondary.color }}
                  className="px-4 py-2 transition-colors"
                >
                  Cancelar
                </button>
                {childId && (
                  <button
                    type="button"
                    onClick={handleAddChild}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }}
                    className="px-4 py-2 rounded-lg transition-all"
                  >
                    Adicionar Conta
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Remover Conta */}
        {showRemoveChildModal && selectedChild && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div 
              style={{
                ...styles.surface,
                borderColor: styles.border.borderColor,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              className="rounded-lg max-w-md w-full p-6"
            >
              <h3 
                style={{ color: styles.text.color }}
                className="text-lg font-semibold mb-4"
              >
                Confirmar Remoção
              </h3>
              
              <div className="mb-6">
                <p 
                  style={{ color: styles.textSecondary.color }}
                  className="mb-4"
                >
                  Tem certeza que deseja remover a seguinte conta do seu gerenciamento?
                </p>
                
                <div 
                  style={{
                    backgroundColor: styles.background.backgroundColor,
                    borderColor: styles.border.borderColor,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  className="p-4 rounded-lg"
                >
                  <div className="space-y-2">
                    <div>
                      <span 
                        style={{ color: styles.textSecondary.color }}
                        className="text-sm font-medium"
                      >
                        Nome:
                      </span>
                      <p 
                        style={{ color: styles.text.color }}
                        className="font-medium"
                      >
                        {selectedChild.name || selectedChild.username}
                      </p>
                    </div>
                    <div>
                      <span 
                        style={{ color: styles.textSecondary.color }}
                        className="text-sm font-medium"
                      >
                        Email:
                      </span>
                      <p 
                        style={{ color: styles.text.color }}
                      >
                        {selectedChild.email || 'Email não informado'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p 
                  style={{ color: styles.textMuted.color }}
                  className="text-sm mt-4"
                >
                  Esta ação removerá a conta do seu gerenciamento, mas não deletará a conta.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveChildModal(false);
                    setSelectedChild(null);
                  }}
                  style={{ color: styles.textSecondary.color }}
                  className="px-4 py-2 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRemoveChild}
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: 'white'
                  }}
                  className="px-4 py-2 rounded-lg transition-all"
                >
                  Confirmar Remoção
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
