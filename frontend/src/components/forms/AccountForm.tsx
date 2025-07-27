"use client";
import { useState, useEffect } from 'react';
import { Modal, FormField } from '../ui';
import { Account, AccountCreateRequest, AccountUpdateRequest } from '@/lib/types/account';
import { accountsService } from '@/lib/services/accountsService';

interface AccountFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: AccountCreateRequest) => Promise<void>;
  readonly account?: Account;
  readonly isLoading?: boolean;
}

export default function AccountForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  account, 
  isLoading = false 
}: AccountFormProps) {
  const [formData, setFormData] = useState<AccountCreateRequest>({
    description: account?.description || '',
    balance: account?.balance || 0,
    credit: account?.credit || undefined,
    dueDate: account?.dueDate || undefined
  });

  const [errors, setErrors] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [actionLoading, setActionLoading] = useState<{[key: number]: 'edit' | 'delete'}>({});

  // Carregar contas quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  // Atualizar formulário quando account prop mudar
  useEffect(() => {
    if (account) {
      setFormData({
        description: account.description,
        balance: account.balance,
        credit: account.credit,
        dueDate: account.dueDate
      });
      setEditingAccount(account);
    } else {
      setFormData({
        description: '',
        balance: 0,
        credit: undefined,
        dueDate: undefined
      });
      setEditingAccount(null);
    }
  }, [account]);

  const loadAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      // Verificar se o gerenciamento familiar está ativo
      const shouldUseParentMode = typeof window !== 'undefined' 
        ? localStorage.getItem('familyManagementEnabled') === 'true'
        : false;
      
      const accountsData = await accountsService.getAll(shouldUseParentMode);
      setAccounts(accountsData);
    } catch (error) {
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleEdit = (accountToEdit: Account) => {
    setFormData({
      description: accountToEdit.description,
      balance: accountToEdit.balance,
      credit: accountToEdit.credit,
      dueDate: accountToEdit.dueDate
    });
    setEditingAccount(accountToEdit);
  };

  const handleDelete = async (accountId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [accountId]: 'delete' }));
      await accountsService.delete(accountId);
      await loadAccounts(); // Recarregar lista
    } catch (error) {
      setErrors('Erro ao excluir conta. Tente novamente.');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[accountId];
        return newState;
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingAccount) return;

    try {
      setErrors('');
      
      // Validações básicas
      if (!formData.description.trim()) {
        setErrors('Descrição da conta é obrigatória');
        return;
      }

      const updateData: AccountUpdateRequest = {
        description: formData.description,
        balance: formData.balance,
        credit: formData.credit,
        dueDate: formData.dueDate
      };

      await accountsService.update(editingAccount.id, updateData);
      await loadAccounts(); // Recarregar lista
      handleClearForm();
    } catch (error) {
      setErrors('Erro ao atualizar conta. Tente novamente.');
    }
  };

  const handleClearForm = () => {
    setFormData({
      description: '',
      balance: 0,
      credit: undefined,
      dueDate: undefined
    });
    setEditingAccount(null);
    setErrors('');
  };

  const handleSubmit = async () => {
    try {
      setErrors('');
      
      // Validações básicas
      if (!formData.description.trim()) {
        setErrors('Descrição da conta é obrigatória');
        return;
      }

      if (editingAccount) {
        // Atualizar conta existente
        await handleUpdate();
      } else {
        // Criar nova conta
        await onSubmit(formData);
        await loadAccounts(); // Recarregar lista após criar
      }
      
      handleClearForm();
    } catch (error) {
      setErrors('Erro ao salvar conta. Tente novamente.');
    }
  };

  const handleClose = () => {
    handleClearForm();
    onClose();
  };

  // Função para gerar cor baseada no ID (simples)
  const getAccountColor = (id: number): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800'
    ];
    return colors[id % colors.length];
  };

  const updateFormData = (field: keyof AccountCreateRequest) => (value: string) => {
    setFormData(prev => {
      let newValue: string | number | undefined = value;
      
      if (field === 'balance' || field === 'credit' || field === 'dueDate') {
        newValue = value ? parseFloat(value) : undefined;
      }
      
      return {
        ...prev,
        [field]: newValue
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingAccount ? 'Editar Conta' : 'Nova Conta'}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[500px]">
        {/* Coluna esquerda - Formulário (ocupa 3 colunas) */}
        <div className="lg:col-span-3 space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3">
            {editingAccount ? 'Editar Conta' : 'Criar Nova Conta'}
          </h4>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            {errors && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errors}
              </div>
            )}

            <div className="space-y-6">
              <FormField
                label="Descrição da Conta"
                name="description"
                type="text"
                value={formData.description}
                onChange={updateFormData('description')}
                required
                placeholder="Ex: Conta Corrente Banco XYZ, Cartão Nu"
                disabled={isLoading}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Saldo Inicial"
                  name="balance"
                  type="number"
                  value={formData.balance || 0}
                  onChange={updateFormData('balance')}
                  placeholder="0.00"
                  disabled={isLoading}
                />

                <FormField
                  label="Limite de Crédito (opcional)"
                  name="credit"
                  type="number"
                  value={formData.credit || ''}
                  onChange={updateFormData('credit')}
                  placeholder="Ex: 5000.00"
                  disabled={isLoading}
                />
              </div>

              <FormField
                label="Dia do Vencimento (opcional)"
                name="dueDate"
                type="number"
                value={formData.dueDate || ''}
                onChange={updateFormData('dueDate')}
                placeholder="Ex: 10 (dia do mês para vencimento)"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {editingAccount ? 'Modificando conta existente' : 'Criando nova conta'}
              </div>
              <div className="flex space-x-3">
                {editingAccount && (
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancelar Edição
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formData.description.trim() || isLoading}
                  className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      {editingAccount ? 'Atualizar Conta' : 'Criar Conta'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Coluna direita - Tabela de contas (ocupa 2 colunas) */}
        <div className="lg:col-span-2 space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3">
            Contas Existentes
            {!isLoadingAccounts && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({accounts.length} {accounts.length === 1 ? 'conta' : 'contas'})
              </span>
            )}
          </h4>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoadingAccounts ? (
              <div className="flex justify-center items-center py-8">
                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <>
                {accounts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhuma conta encontrada
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className={`p-4 border rounded-lg ${
                          editingAccount?.id === acc.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountColor(acc.id)}`}>
                                #{acc.id}
                              </span>
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {acc.description}
                              </h5>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <p>Saldo: R$ {acc.balance?.toFixed(2) || '0.00'}</p>
                              {acc.credit && <p>Crédito: R$ {acc.credit.toFixed(2)}</p>}
                              {acc.dueDate && <p>Vencimento: Dia {acc.dueDate}</p>}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(acc)}
                              disabled={actionLoading[acc.id] === 'delete'}
                              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-md transition-colors disabled:opacity-50"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(acc.id)}
                              disabled={actionLoading[acc.id] === 'delete'}
                              className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-md transition-colors disabled:opacity-50"
                            >
                              {actionLoading[acc.id] === 'delete' ? (
                                <>
                                  <svg className="animate-spin h-3 w-3 text-red-600 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Excluindo...
                                </>
                              ) : (
                                'Excluir'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Botão de fechar no rodapé */}
      <div className="flex justify-end pt-8 mt-8 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={handleClose}
          className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Fechar Modal
        </button>
      </div>
    </Modal>
  );
}
