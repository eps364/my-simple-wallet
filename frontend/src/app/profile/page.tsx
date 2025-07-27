"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/lib/services/usersService';
import { User } from '@/lib/types/user';
import { LoadingSpinner, QRCodeGenerator, QRCodeReader, MonitoringToggle } from '@/components/ui';
import { useFamilyManagement } from '@/lib/hooks/useParentMonitoring';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para modais de edição
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showRemoveParentModal, setShowRemoveParentModal] = useState(false);
  
  // Estados para formulários
  const [editData, setEditData] = useState({ username: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentId, setParentId] = useState('');
  const [useQRScanner, setUseQRScanner] = useState(false);
  const [parentData, setParentData] = useState<{ username: string; email: string } | null>(null);
  
  const router = useRouter();
  const { isManagementEnabled, toggleManagement } = useFamilyManagement();

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
        email: userProfile.email || ''
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
      // Buscar dados do parent
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20">
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Erro ao carregar perfil do usuário</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas informações pessoais</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações do Perfil */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Informações Pessoais
              </h2>
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </span>
                  <p className="text-gray-900 dark:text-white font-medium">{user.username}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </span>
                  <p className="text-gray-900 dark:text-white">{user.email || 'Não informado'}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID do Usuário
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">{user.id}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent ID
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 dark:text-white">
                      {user.parentId || 'Nenhum parent definido'}
                    </p>
                    {user.parentId ? (
                      <button
                        onClick={handleOpenRemoveParentModal}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remover
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowParentModal(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Alterar Senha
              </button>
            </div>

            {/* Seção de Gerenciamento para Parents */}
            {user.isParent && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Gerenciamento Familiar
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ative para gerenciar as finanças dos seus filhos
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${
                      isManagementEnabled 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isManagementEnabled ? 'Ativo' : 'Inativo'}
                    </span>
                    
                    <MonitoringToggle
                      isEnabled={isManagementEnabled}
                      onToggle={toggleManagement}
                    />
                  </div>
                </div>
                
                {isManagementEnabled && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Gerenciamento ativado! Você pode visualizar as finanças dos seus filhos.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Usuários Filhos */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Usuários Filhos ({children.length})
            </h2>

            {children.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  Você não possui usuários filhos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {child.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {child.email}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {child.id.substring(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Editar Perfil */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Editar Perfil
              </h3>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      id="edit-username"
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      id="edit-email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Alterar Senha
              </h3>
              
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nova Senha
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      required
                      minLength={6}
                      placeholder="Digite sua nova senha"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      required
                      minLength={6}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>

                  {/* Indicador visual de compatibilidade das senhas */}
                  {newPassword && confirmPassword && (
                    <div className={`text-sm ${
                      newPassword === confirmPassword 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
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
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Parent
              </h3>
              
              {/* Toggle entre input manual e QR scanner */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUseQRScanner(false)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    !useQRScanner 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Digite o ID
                </button>
                <button
                  type="button"
                  onClick={() => setUseQRScanner(true)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    useQRScanner 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Escanear QR
                </button>
              </div>

              {useQRScanner ? (
                /* Interface do QR Scanner */
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aponte a câmera para o QR code do usuário parent:
                  </p>
                  <QRCodeReader
                    onScan={handleQRScan}
                    onError={handleQRError}
                    isActive={useQRScanner}
                    className="w-full"
                  />
                  {parentId && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ID detectado: <span className="font-mono">{parentId}</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Interface do input manual */
                <form onSubmit={(e) => { e.preventDefault(); handleAddParent(); }}>
                  <div>
                    <label htmlFor="parent-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID do Parent
                    </label>
                    <input
                      id="parent-id"
                      type="text"
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Digite o ID do usuário parent"
                      required
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
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                {parentId && (
                  <button
                    type="button"
                    onClick={handleAddParent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirmar Remoção de Parent
              </h3>
              
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Tem certeza que deseja remover o seguinte usuário como seu parent?
                </p>
                
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Username:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{parentData.username}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                      <p className="text-gray-900 dark:text-white">{parentData.email}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
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
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRemoveParent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
