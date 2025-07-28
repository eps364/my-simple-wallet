"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/lib/services/usersService';
import { User } from '@/lib/types/user';
import { LoadingSpinner, QRCodeGenerator, QRCodeReader, MonitoringToggle, ThemeSelector } from '@/components/ui';
import { useFamilyManagement } from '@/lib/hooks/useParentMonitoring';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showRemoveParentModal, setShowRemoveParentModal] = useState(false);
  const [showRemoveChildModal, setShowRemoveChildModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<User | null>(null);

  const [editData, setEditData] = useState({ username: '', email: '', name: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentId, setParentId] = useState('');
  const [useQRScanner, setUseQRScanner] = useState(false);
  const [parentData, setParentData] = useState<{ username: string; email: string } | null>(null);

  const router = useRouter();
  const { isManagementEnabled, toggleManagement } = useFamilyManagement();
  const styles = useThemeStyles();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const [userProfile, userChildren] = await Promise.all([
        usersService.getProfile(),
        usersService.getChildren().catch(() => []) // Se der erro, retorna array vazio
      ]);

      setUser(userProfile);
      setChildren(userChildren);
      setEditData({
        username: userProfile.username,
        email: userProfile.email || '',
        name: userProfile.name || ''
      });
    } catch {
      setError('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const updatedUser = await usersService.updateProfile(editData);
      setUser(updatedUser);
      setShowEditProfile(false);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar se as senhas coincidem
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setError('');
      await usersService.updatePassword(newPassword);
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Senha alterada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao alterar senha');
    }
  };

  const handleAddParent = async () => {
    try {
      setError('');
      const updatedUser = await usersService.updateParent(parentId);
      setUser(updatedUser);
      setShowParentModal(false);
      setParentId('');
      setUseQRScanner(false);
      setSuccess('Parent adicionado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao adicionar parent');
    }
  };

  const handleQRScan = (scannedId: string) => {
    setParentId(scannedId);
    setUseQRScanner(false);
    setSuccess('QR Code lido com sucesso! Verifique o ID e confirme.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleQRError = (error: string) => {
    setError(error);
    setTimeout(() => setError(''), 3000);
  };

  const handleRemoveParent = async () => {
    try {
      setError('');
      const updatedUser = await usersService.removeParent();
      setUser(updatedUser);
      setShowRemoveParentModal(false);
      setParentData(null);
      setSuccess('Parent removido com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao remover parent');
    }
  };

  const handleOpenRemoveParentModal = async () => {
    if (!user?.parentId) return;

    try {
      setError('');
      const parentUser = await usersService.getUserById(user.parentId);
      setParentData({
        username: parentUser.username,
        email: parentUser.email || 'Email não informado'
      });
      setShowRemoveParentModal(true);
    } catch {
      setError('Erro ao buscar dados do parent');
    }
  };

  const handleOpenRemoveChildModal = (child: User) => {
    setSelectedChild(child);
    setShowRemoveChildModal(true);
  };

  const handleRemoveChild = async () => {
    if (!selectedChild) return;

    try {
      setError('');
      await usersService.removeChild(selectedChild.id);
      setChildren(children.filter(child => child.id !== selectedChild.id));
      setShowRemoveChildModal(false);
      setSelectedChild(null);
      setSuccess('Usuário removido do seu gerenciamento com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao remover usuário gerenciado');
    }
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
              Erro ao carregar perfil do usuário
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
      className="container mx-auto px-4 py-8 min-h-screen max-w-5xl"
      style={{ backgroundColor: styles.background.backgroundColor }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{ color: styles.text.color }}
          className="text-3xl font-bold"
        >
          Meu Perfil
        </h1>
        <p
          style={{ color: styles.textSecondary.color }}
          className="mt-2"
        >
          Gerencie suas informações pessoais
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
        {/* Informações do Perfil */}
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
              Informações Pessoais
            </h2>
            <button
              onClick={() => setShowEditProfile(true)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
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
                  ID do Usuário
                </span>
                <p
                  style={{ color: styles.textMuted.color }}
                  className="text-sm font-mono"
                >
                  {user.id}
                </p>
              </div>

              <div>
                <span
                  style={{ color: styles.textSecondary.color }}
                  className="block text-sm font-medium mb-1"
                >
                  Parent ID
                </span>
                <div className="flex items-center gap-2">
                  <p
                    style={{ color: styles.text.color }}
                  >
                    {user.parentId || 'Nenhum parent definido'}
                  </p>
                  {user.parentId ? (
                    <button
                      onClick={handleOpenRemoveParentModal}
                      style={{ color: 'var(--color-error)' }}
                      className="text-sm transition-colors"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowParentModal(true)}
                      style={{ color: 'var(--color-primary)' }}
                      className="text-sm transition-colors"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Adicionar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderColor: styles.border.borderColor,
              borderTopWidth: '1px',
              borderTopStyle: 'solid'
            }}
            className="mt-6 pt-6"
          >
            <button
              onClick={() => setShowChangePassword(true)}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: styles.text.color,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.color = styles.text.color;
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Alterar Senha
            </button>
          </div>

        </div>

        {/* Coluna da direita - Tema, Gerenciamento e Contas Gerenciadas */}
        <div className="space-y-6">
          {/* Preferências de Tema */}
          <div
            style={{
              ...styles.surface,
              borderColor: styles.border.borderColor,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="rounded-lg border p-6"
          >
            <h2
              style={{ color: styles.text.color }}
              className="text-xl font-semibold mb-6"
            >
              Preferências de Interface
            </h2>
            <ThemeSelector />
          </div>

          {/* Gerenciamento Familiar */}
          {user.isParent && (
            <div
              style={{
                ...styles.surface,
                borderColor: styles.border.borderColor,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              className="rounded-lg border p-6"
            >
              <h2
                style={{ color: styles.text.color }}
                className="text-xl font-semibold mb-6"
              >
                Gerenciamento Familiar
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p
                    style={{ color: styles.textSecondary.color }}
                    className="text-sm"
                  >
                    Ativar gerenciamento de contas
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isManagementEnabled
                      ? 'text-green-600 dark:text-green-400'
                      : ''
                    }`}
                    style={{
                      color: isManagementEnabled
                        ? 'var(--color-success)'
                        : styles.textMuted.color
                    }}
                  >
                    {isManagementEnabled ? 'Ativo' : 'Inativo'}
                  </span>

                  <MonitoringToggle
                    isEnabled={isManagementEnabled}
                    onToggle={toggleManagement}
                  />
                </div>
              </div>

              {isManagementEnabled && (
                <div
                  style={{
                    backgroundColor: 'var(--color-success)',
                    opacity: 0.9
                  }}
                  className="mt-4 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      style={{ color: 'white' }}
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span
                      style={{ color: 'white' }}
                      className="text-sm font-medium"
                    >
                      Gerenciamento ativado! Você pode visualizar as finanças das contas gerenciadas.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contas Gerenciadas */}
          <div
            style={{
              ...styles.surface,
              borderColor: styles.border.borderColor,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="rounded-lg border p-6"
          >
            <h2
              style={{ color: styles.text.color }}
              className="text-xl font-semibold mb-6"
            >
              Contas Gerenciadas ({children.length})
            </h2>

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
                >
                  Você não possui contas gerenciadas
                </p>
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
                    className="flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <p
                        style={{ color: styles.text.color }}
                        className="font-medium"
                      >
                        {child.username}
                      </p>
                      <p
                        style={{ color: styles.textSecondary.color }}
                        className="text-sm"
                      >
                        {child.email}
                      </p>
                      <p
                        style={{ color: styles.textMuted.color }}
                        className="text-xs font-mono mt-1"
                      >
                        {child.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenRemoveChildModal(child)}
                        style={{ color: 'var(--color-error)' }}
                        className="flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-error)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--color-error)';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Editar Perfil */}
      {showEditProfile && (
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
              Editar Perfil
            </h3>

            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-name"
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-2"
                  >
                    Nome
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    className="w-full px-3 py-2 rounded-md transition-all focus:outline-none"
                    required
                    placeholder="Seu nome de identificação"
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

                <div>
                  <label
                    htmlFor="edit-username"
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="edit-username"
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    className="w-full px-3 py-2 rounded-md transition-all focus:outline-none"
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

                <div>
                  <label
                    htmlFor="edit-email"
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    className="w-full px-3 py-2 rounded-md transition-all focus:outline-none"
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
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  style={{ color: styles.textSecondary.color }}
                  className="px-4 py-2 transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = styles.text.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = styles.textSecondary.color;
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                  className="px-4 py-2 rounded-lg transition-all"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {showChangePassword && (
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
              Alterar Senha
            </h3>

            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-2"
                  >
                    Nova Senha
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    className="w-full px-3 py-2 rounded-md transition-all focus:outline-none"
                    required
                    minLength={6}
                    placeholder="Digite sua nova senha"
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

                <div>
                  <label
                    htmlFor="confirm-password"
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-2"
                  >
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    className="w-full px-3 py-2 rounded-md transition-all focus:outline-none"
                    required
                    minLength={6}
                    placeholder="Confirme sua nova senha"
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

                {/* Indicador visual de compatibilidade das senhas */}
                {newPassword && confirmPassword && (
                  <div
                    style={{
                      color: newPassword === confirmPassword
                        ? 'var(--color-success)'
                        : 'var(--color-error)'
                    }}
                    className="text-sm"
                  >
                    {newPassword === confirmPassword
                      ? '✓ As senhas coincidem'
                      : '✗ As senhas não coincidem'
                    }
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  style={{ color: styles.textSecondary.color }}
                  className="px-4 py-2 transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = styles.text.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = styles.textSecondary.color;
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                  style={{
                    backgroundColor: (!newPassword || !confirmPassword || newPassword !== confirmPassword)
                      ? 'var(--color-muted)'
                      : 'var(--color-primary)',
                    color: 'white',
                    cursor: (!newPassword || !confirmPassword || newPassword !== confirmPassword)
                      ? 'not-allowed'
                      : 'pointer'
                  }}
                  className="px-4 py-2 rounded-lg transition-all"
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    } else {
                      e.currentTarget.style.backgroundColor = 'var(--color-muted)';
                    }
                  }}
                >
                  Alterar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Parent */}
      {showParentModal && (
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
              Adicionar Parent
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
                onMouseEnter={(e) => {
                  if (!useQRScanner) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!useQRScanner) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    e.currentTarget.style.color = styles.text.color;
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }
                }}
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
                onMouseEnter={(e) => {
                  if (useQRScanner) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (useQRScanner) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    e.currentTarget.style.color = styles.text.color;
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }
                }}
              >
                Escanear QR
              </button>
            </div>

            {useQRScanner ? (
              /* Interface do QR Scanner */
              <div className="space-y-4">
                <p
                  style={{ color: styles.textSecondary.color }}
                  className="text-sm"
                >
                  Aponte a câmera para o QR code do usuário parent:
                </p>
                <QRCodeReader
                  onScan={handleQRScan}
                  onError={handleQRError}
                  isActive={useQRScanner}
                  className="w-full"
                />
                {parentId && (
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
                      ID detectado: <span className="font-mono">{parentId}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Interface do input manual */
              <form onSubmit={(e) => { e.preventDefault(); handleAddParent(); }}>
                <div>
                  <label
                    htmlFor="parent-id"
                    style={{ color: styles.textSecondary.color }}
                    className="block text-sm font-medium mb-2"
                  >
                    ID do Parent
                  </label>
                  <input
                    id="parent-id"
                    type="text"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    className="w-full px-3 py-2 rounded-md transition-all focus:outline-none"
                    placeholder="Digite o ID do usuário parent"
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

                {/* Botão submit invisível para funcionar com Enter */}
                <button type="submit" className="hidden" />
              </form>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowParentModal(false);
                  setUseQRScanner(false);
                  setParentId('');
                }}
                style={{ color: styles.textSecondary.color }}
                className="px-4 py-2 transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = styles.text.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = styles.textSecondary.color;
                }}
              >
                Cancelar
              </button>
              {parentId && (
                <button
                  type="button"
                  onClick={handleAddParent}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                  className="px-4 py-2 rounded-lg transition-all"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  }}
                >
                  Adicionar Parent
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Remoção de Parent */}
      {showRemoveParentModal && parentData && (
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
              Confirmar Remoção de Parent
            </h3>

            <div className="mb-6">
              <p
                style={{ color: styles.textSecondary.color }}
                className="mb-4"
              >
                Tem certeza que deseja remover o seguinte usuário como seu parent?
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
                      Username:
                    </span>
                    <p
                      style={{ color: styles.text.color }}
                      className="font-medium"
                    >
                      {parentData.username}
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
                      {parentData.email}
                    </p>
                  </div>
                </div>
              </div>

              <p
                style={{ color: styles.textMuted.color }}
                className="text-sm mt-4"
              >
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRemoveParentModal(false);
                  setParentData(null);
                }}
                style={{ color: styles.textSecondary.color }}
                className="px-4 py-2 transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = styles.text.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = styles.textSecondary.color;
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRemoveParent}
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'white'
                }}
                className="px-4 py-2 rounded-lg transition-all"
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Remoção de Usuário Gerenciado */}
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
              Confirmar Remoção de Gerenciamento
            </h3>

            <div className="mb-6">
              <p
                style={{ color: styles.textSecondary.color }}
                className="mb-4"
              >
                Tem certeza que deseja remover o seguinte usuário do seu gerenciamento?
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
                      Username:
                    </span>
                    <p
                      style={{ color: styles.text.color }}
                      className="font-medium"
                    >
                      {selectedChild.username}
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
                      {selectedChild.email}
                    </p>
                  </div>
                  <div>
                    <span
                      style={{ color: styles.textSecondary.color }}
                      className="text-sm font-medium"
                    >
                      ID:
                    </span>
                    <p
                      style={{ color: styles.textMuted.color }}
                      className="text-xs font-mono"
                    >
                      {selectedChild.id}
                    </p>
                  </div>
                </div>
              </div>

              <p
                style={{ color: styles.textMuted.color }}
                className="text-sm mt-4"
              >
                O usuário não será mais gerenciado por você e você perderá acesso às suas informações financeiras.
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = styles.text.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = styles.textSecondary.color;
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
