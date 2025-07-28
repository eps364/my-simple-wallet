"use client";

import { useState, useEffect } from 'react';
import { Modal, FormField } from '../ui';
import { Transaction, TransactionCreateRequest, TransactionUpdateRequest, TransactionType } from '@/lib/types/transaction';
import { Account } from '@/lib/types/account';
import { Category, CATEGORY_TYPE_MAP } from '@/lib/types/category';
import { transactionsService } from '@/lib/services/transactionsService';
import { accountsService } from '@/lib/services/accountsService';
import { categoriesService } from '@/lib/services/categoriesService';
import { usersService } from '@/lib/services/usersService';

interface TransactionModalProps {
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit' | 'delete' | 'settle';
  readonly transaction?: Transaction;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export default function TransactionModal({ 
  isOpen, 
  mode, 
  transaction, 
  onClose, 
  onSuccess 
}: TransactionModalProps) {
  const [formData, setFormData] = useState<TransactionCreateRequest>({
    description: '',
    amount: 0,
    type: TransactionType.EXPENSE,
    dueDate: new Date().toISOString().split('T')[0],
    effectiveDate: '',
    effectiveAmount: undefined,
    accountId: 0,
    categoryId: undefined
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string>('');

  // Carregar accounts e categories quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadAccountsAndCategories();
    }
  }, [isOpen]);

  // Atualizar formulário quando transaction prop mudar
  useEffect(() => {
    if (transaction && (mode === 'edit' || mode === 'delete' || mode === 'settle')) {
      // Converte datas do formato DD/MM/YYYY para YYYY-MM-DD se necessário
      const convertDateToInputFormat = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes('/')) {
          // Formato DD/MM/YYYY -> YYYY-MM-DD
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateStr;
      };

      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        dueDate: convertDateToInputFormat(transaction.dueDate),
        effectiveDate: mode === 'settle' ? new Date().toISOString().split('T')[0] : convertDateToInputFormat(transaction.effectiveDate || ''),
        effectiveAmount: mode === 'settle' ? transaction.amount : transaction.effectiveAmount,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId
      });
    } else if (mode === 'create') {
      setFormData({
        description: '',
        amount: 0,
        type: TransactionType.EXPENSE,
        dueDate: new Date().toISOString().split('T')[0],
        effectiveDate: '',
        effectiveAmount: undefined,
        accountId: accounts.length > 0 ? accounts[0].id : 0,
        categoryId: undefined
      });
    }
    setError('');
  }, [transaction, mode, isOpen, accounts]);

  const loadAccountsAndCategories = async () => {
    try {
      setIsLoadingData(true);
      // Verificar se o gerenciamento familiar está ativo
      const shouldUseParentMode = typeof window !== 'undefined' 
        ? localStorage.getItem('familyManagementEnabled') === 'true'
        : false;
      
      // Buscar usuário logado
      const user = await usersService.getProfile();
      const [accountsData, categoriesData] = await Promise.all([
        accountsService.getAll(shouldUseParentMode),
        categoriesService.getAll(shouldUseParentMode)
      ]);
      // Filtrar apenas contas e categorias do usuário logado
      const myAccounts = accountsData.filter(acc => String(acc.userId) === user.id);
      const myCategories = categoriesData.filter(cat => String(cat.userId) === user.id);
      setAccounts(myAccounts);
      setCategories(myCategories);
    } catch (error) {
      setError('Erro ao carregar contas e categorias');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Filtrar categorias baseado no tipo de transação
  const getFilteredCategories = () => {
    return categories.filter(category => {
      // Usar o mapeamento: INCOME (0) -> IN, EXPENSE (1) -> EX
      const expectedCategoryType = CATEGORY_TYPE_MAP[formData.type as keyof typeof CATEGORY_TYPE_MAP];
      return category.type === expectedCategoryType;
    });
  };

  const handleCreate = async () => {
    try {
      setError('');
      setIsLoading(true);

      // Validações básicas
      if (!formData.description.trim()) {
        setError('Descrição da transação é obrigatória');
        return;
      }

      if (formData.amount <= 0) {
        setError('Valor deve ser maior que zero');
        return;
      }

      if (formData.accountId === 0) {
        setError('Conta é obrigatória');
        return;
      }

      if (!formData.dueDate) {
        setError('Data de vencimento é obrigatória');
        return;
      }

      await transactionsService.create(formData);
      onSuccess();
    } catch (error) {
      setError('Erro ao criar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!transaction) return;

    try {
      setError('');
      setIsLoading(true);

      // Validações básicas
      if (!formData.description.trim()) {
        setError('Descrição da transação é obrigatória');
        return;
      }

      if (formData.amount <= 0) {
        setError('Valor deve ser maior que zero');
        return;
      }

      if (formData.accountId === 0) {
        setError('Conta é obrigatória');
        return;
      }

      if (!formData.dueDate) {
        setError('Data de vencimento é obrigatória');
        return;
      }

      const updateData: TransactionUpdateRequest = {
        description: formData.description.trim(),
        amount: formData.amount,
        type: formData.type,
        dueDate: formData.dueDate,
        effectiveDate: formData.effectiveDate || undefined,
        effectiveAmount: formData.effectiveAmount,
        accountId: formData.accountId,
        categoryId: formData.categoryId
      };

      await transactionsService.update(transaction.id, updateData);
      onSuccess();
    } catch (error) {
      setError('Erro ao atualizar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      setError('');
      setIsLoading(true);
      await transactionsService.delete(transaction.id);
      onSuccess();
    } catch (error) {
      setError('Erro ao excluir transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!transaction) return;

    try {
      setError('');
      setIsLoading(true);

      // Validações para liquidação
      if (!formData.effectiveDate) {
        setError('Data efetiva é obrigatória para liquidação');
        return;
      }

      if (!formData.effectiveAmount || formData.effectiveAmount <= 0) {
        setError('Valor efetivo deve ser maior que zero');
        return;
      }

      await transactionsService.settle(transaction.id, {
        effectiveDate: formData.effectiveDate,
        effectiveAmount: formData.effectiveAmount
      });
      onSuccess();
    } catch (error) {
      setError('Erro ao liquidar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      await handleCreate();
    } else if (mode === 'edit') {
      await handleUpdate();
    } else if (mode === 'delete') {
      await handleDelete();
    } else if (mode === 'settle') {
      await handleSettle();
    }
  };

  const handleChange = (field: keyof TransactionCreateRequest, value: string | number | TransactionType | undefined) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Se o tipo mudou, limpar a categoria selecionada
      if (field === 'type') {
        newData.categoryId = undefined;
      }
      
      return newData;
    });
  };

  const getModalTitle = () => {
    if (mode === 'create') return 'Adicionar Nova Transação';
    if (mode === 'edit') return 'Editar Transação';
    if (mode === 'delete') return 'Excluir Transação';
    if (mode === 'settle') return 'Liquidar Transação';
    return 'Transação';
  };

  const getSubmitButtonText = () => {
    if (isLoading) return 'Carregando...';
    if (mode === 'create') return 'Adicionar';
    if (mode === 'edit') return 'Salvar';
    if (mode === 'delete') return 'Excluir';
    if (mode === 'settle') return 'Liquidar';
    return 'Confirmar';
  };

  const getSubmitButtonClass = () => {
    const baseClass = "px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
    if (mode === 'delete') {
      return `${baseClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
    }
    return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
  };

  const getModalVariant = () => {
    if (mode === 'delete') return 'danger';
    if (mode === 'settle') return 'success';
    return 'default';
  };

  const renderFooter = () => (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="transaction-form"
        disabled={isLoading || isLoadingData}
        className={getSubmitButtonClass()}
      >
        {getSubmitButtonText()}
      </button>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={getModalTitle()} 
      size="lg"
      variant={getModalVariant()}
      footer={renderFooter()}
    >
      <form id="transaction-form" onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isLoadingData && (
          <div className="text-center py-8">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600 dark:text-gray-400">Carregando dados...</span>
            </div>
          </div>
        )}

        {(() => {
          if (mode === 'delete') {
            return (
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Tem certeza que deseja excluir esta transação?
                </p>
                {transaction && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}: 
                      R$ {transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vencimento: {transaction.dueDate}
                    </p>
                    {transaction.effectiveDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Data Efetiva: {transaction.effectiveDate}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-sm text-red-600">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            );
          }

          if (mode === 'settle') {
            return (
              <div className="space-y-6">
                {transaction && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Liquidar Transação
                    </h4>
                    <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <p><strong>Descrição:</strong> {transaction.description}</p>
                      <p><strong>Valor Planejado:</strong> R$ {transaction.amount.toFixed(2)}</p>
                      <p><strong>Vencimento:</strong> {transaction.dueDate}</p>
                      <p><strong>Conta:</strong> {transaction.account}</p>
                      {transaction.category && (
                        <p><strong>Categoria:</strong> {transaction.category}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <FormField
                    label="Data Efetiva"
                    name="effectiveDate"
                    type="date"
                    value={formData.effectiveDate || ''}
                    onChange={(value) => handleChange('effectiveDate', value)}
                    required
                  />

                  <FormField
                    label="Valor Efetivo"
                    name="effectiveAmount"
                    type="number"
                    value={formData.effectiveAmount || ''}
                    onChange={(value) => handleChange('effectiveAmount', parseFloat(value) || undefined)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            );
          }

          // Modo create ou edit
          return (
            <div className="space-y-6">
              <FormField
                label="Conta"
                name="accountId"
                type="select"
                value={formData.accountId}
                onChange={(value) => handleChange('accountId', parseInt(value))}
                options={accounts.map(account => ({
                  value: account.id,
                  label: account.description
                }))}
                required
                labelExtra={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = '/accounts?action=create';
                      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                      if (newWindow) {
                        newWindow.focus();
                      } else {
                        // Fallback se popup foi bloqueado
                        window.location.href = url;
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    title="Abrir página de contas em nova aba"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adicionar
                  </button>
                }
              />

              <FormField
                label="Descrição"
                name="description"
                type="text"
                value={formData.description}
                onChange={(value) => handleChange('description', value)}
                placeholder="Ex: Supermercado, Salário, etc."
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Valor"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(value) => handleChange('amount', parseFloat(value) || 0)}
                  placeholder="0.00"
                  required
                />

                <FormField
                  label="Tipo"
                  name="type"
                  type="select"
                  value={formData.type.toString()}
                  onChange={(value) => handleChange('type', parseInt(value) as TransactionType)}
                  options={[
                    { value: TransactionType.INCOME.toString(), label: 'Receita' },
                    { value: TransactionType.EXPENSE.toString(), label: 'Despesa' }
                  ]}
                  required
                />
              </div>

              <FormField
                label="Categoria (Opcional)"
                name="categoryId"
                type="select"
                value={formData.categoryId || ''}
                onChange={(value) => handleChange('categoryId', value ? parseInt(value) : undefined)}
                options={[
                  { value: '', label: 'Nenhuma categoria' },
                  ...getFilteredCategories().map(category => ({
                    value: category.id,
                    label: category.category
                  }))
                ]}
                labelExtra={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = '/categories?action=create';
                      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                      if (newWindow) {
                        newWindow.focus();
                      } else {
                        // Fallback se popup foi bloqueado
                        window.location.href = url;
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    title="Abrir página de categorias em nova aba"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adicionar
                  </button>
                }
              />

              <FormField
                label="Data de Vencimento"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(value) => handleChange('dueDate', value)}
                required
              />

              <FormField
                label="Data Efetiva (Opcional)"
                name="effectiveDate"
                type="date"
                value={formData.effectiveDate || ''}
                onChange={(value) => handleChange('effectiveDate', value || undefined)}
              />

              <FormField
                label="Valor Efetivo (Opcional)"
                name="effectiveAmount"
                type="number"
                value={formData.effectiveAmount || ''}
                onChange={(value) => handleChange('effectiveAmount', parseFloat(value) || undefined)}
                placeholder="0.00"
              />
            </div>
          );
        })()}
      </form>
    </Modal>
  );
}
