"use client";

import { useState, useEffect } from 'react';
import { Modal, FormField } from '../ui';
import { FormFeedback } from '../ui/FormFeedback';
import { Account, AccountCreateRequest, AccountUpdateRequest } from '@/lib/types/account';
import { accountsService } from '@/lib/services/accountsService';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

interface AccountModalProps {
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit' | 'delete';
  readonly account?: Account;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export default function AccountModal({
  isOpen,
  mode,
  account,
  onClose,
  onSuccess
}: AccountModalProps) {
  const [formData, setFormData] = useState<AccountCreateRequest>({
    description: '',
    balance: 0,
    credit: undefined,
    dueDate: undefined
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const styles = useThemeStyles();

  useEffect(() => {
    if (account && (mode === 'edit' || mode === 'delete')) {
      setFormData({
        description: account.description,
        balance: account.balance,
        credit: account.credit,
        dueDate: account.dueDate
      });
    } else if (mode === 'create') {
      setFormData({
        description: '',
        balance: 0,
        credit: undefined,
        dueDate: undefined
      });
    }
    setError('');
  }, [account, mode, isOpen]);

  const handleCreate = async () => {
    try {
      setError('');
      setIsLoading(true);

      if (!formData.description.trim()) {
        setError('Descrição da conta é obrigatória');
        return;
      }

      const dataToSend = {
        description: formData.description.trim(),
        balance: formData.balance || 0.00,
        credit: formData.credit || 0.00,
        dueDate: formData.dueDate || 1
      };

      await accountsService.create(dataToSend);
      onSuccess();
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!account) return;

    try {
      setError('');
      setIsLoading(true);

      if (!formData.description.trim()) {
        setError('Descrição da conta é obrigatória');
        return;
      }

      const updateData: AccountUpdateRequest = {
        description: formData.description.trim(),
        balance: formData.balance || 0.00,
        credit: formData.credit || 0.00,
        dueDate: formData.dueDate || 1
      };

      await accountsService.update(account.id, updateData);
      onSuccess();
    } catch {
      setError('Erro ao atualizar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;

    try {
      setError('');
      setIsLoading(true);

      await accountsService.delete(account.id);
      onSuccess();
    } catch (err: unknown) {
      // Tenta extrair mensagem da API
      let errorMsg = 'Erro ao excluir conta. Tente novamente.';
      if (err instanceof Error && err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'create') {
      await handleCreate();
    } else if (mode === 'edit') {
      await handleUpdate();
    } else if (mode === 'delete') {
      await handleDelete();
    }
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

  const getModalTitle = () => {
    if (mode === 'create') return 'Nova Conta';
    if (mode === 'edit') return 'Editar Conta';
    if (mode === 'delete') return 'Excluir Conta';
    return 'Conta';
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      if (mode === 'create') return 'Criando...';
      if (mode === 'edit') return 'Salvando...';
      if (mode === 'delete') return 'Excluindo...';
    }

    if (mode === 'create') return 'Criar Conta';
    if (mode === 'edit') return 'Salvar Alterações';
    if (mode === 'delete') return 'Confirmar Exclusão';
    return 'Salvar';
  };

  const getModalVariant = () => {
    if (mode === 'delete') return 'danger';
    return 'default';
  };

  const renderFooter = () => (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        style={{
          ...styles.surface,
          borderColor: styles.border.borderColor,
          color: styles.text.color
        }}
        className="px-4 py-2 border rounded-lg hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = styles.background.backgroundColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = styles.surface.backgroundColor;
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = styles.border.borderColor;
        }}
      >
        Cancelar
      </button>
      {mode === 'delete' ? (
        <button
          type="button"
          disabled={isLoading}
          onClick={handleSubmit}
          style={{
            backgroundColor: 'var(--color-error)',
            color: 'white'
          }}
          className="px-4 py-2 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50"
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--color-error)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--color-error)';
            }
          }}
        >
          {getSubmitButtonText()}
        </button>
      ) : (
        <button
          type="submit"
          form="account-form"
          disabled={isLoading}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
          className="px-4 py-2 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50"
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }
          }}
        >
          {getSubmitButtonText()}
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="md"
      variant={getModalVariant()}
      footer={renderFooter()}
    >
      {error && (
        <div className="mb-6">
          <FormFeedback message={error} type="error" />
        </div>
      )}

      {mode === 'delete' ? (
        <div className="space-y-4">
          <div
            style={{
              backgroundColor: 'var(--color-warning)',
              borderColor: 'var(--color-warning)',
              color: 'white',
              opacity: 0.1
            }}
            className="p-4 border rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <svg
                style={{ color: 'var(--color-warning)' }}
                className="w-6 h-6 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4
                  style={{ color: 'var(--color-warning)' }}
                  className="text-lg font-medium"
                >
                  Confirmar Exclusão
                </h4>
                <p
                  style={{ color: styles.text.color }}
                  className="mt-1"
                >
                  Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>

          {account && (
            <div
              style={{
                ...styles.background,
                borderColor: styles.border.borderColor
              }}
              className="rounded-lg p-4 border"
            >
              <h5
                style={{ color: styles.text.color }}
                className="font-medium mb-2"
              >
                Conta a ser excluída:
              </h5>
              <div
                style={{ color: styles.textSecondary.color }}
                className="space-y-1 text-sm"
              >
                <p><span className="font-medium">ID:</span> #{account.id}</p>
                <p><span className="font-medium">Descrição:</span> {account.description}</p>
                <p><span className="font-medium">Saldo:</span> R$ {account.balance?.toFixed(2) || '0.00'}</p>
                {account.credit !== undefined && account.credit !== null && (
                  <p><span className="font-medium">Limite:</span> R$ {account.credit.toFixed(2)}</p>
                )}
                {account.dueDate && (
                  <p><span className="font-medium">Vencimento:</span> Dia {account.dueDate}</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form id="account-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
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
              placeholder="0.00 (padrão)"
              disabled={isLoading}
            />

            <FormField
              label="Limite de Crédito (opcional)"
              name="credit"
              type="number"
              value={formData.credit || ''}
              onChange={updateFormData('credit')}
              placeholder="0.00 (padrão)"
              disabled={isLoading}
            />
          </div>

          <FormField
            label="Dia do Vencimento (opcional)"
            name="dueDate"
            type="number"
            value={formData.dueDate || ''}
            onChange={updateFormData('dueDate')}
            placeholder="1 (padrão - dia do mês para vencimento)"
            disabled={isLoading}
          />
        </form>
      )}
    </Modal>
  );
}
