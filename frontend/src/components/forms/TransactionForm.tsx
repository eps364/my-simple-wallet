"use client";
import { useState, useEffect } from 'react';
import { Modal, FormField, FormButtons } from '../ui';
import { Transaction, TransactionCreateRequest, TransactionType } from '@/lib/types/transaction';
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';

interface TransactionFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: TransactionCreateRequest) => Promise<void>;
  readonly transaction?: Transaction;
  readonly accounts: Account[];
  readonly categories: Category[];
  readonly isLoading?: boolean;
}

export default function TransactionForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  transaction, 
  accounts,
  categories,
  isLoading = false 
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionCreateRequest>({
    description: transaction?.description || '',
    amount: transaction?.amount || 0,
    type: transaction?.type || TransactionType.EXPENSE,
    categoryId: transaction?.categoryId || undefined,
    accountId: transaction?.accountId || 0,
    date: transaction?.date || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<string>('');

  // Atualiza o accountId padrão quando as contas estão disponíveis
  useEffect(() => {
    if (accounts.length > 0 && !transaction && formData.accountId === 0) {
      setFormData(prev => ({
        ...prev,
        accountId: accounts[0].id
      }));
    }
  }, [accounts, transaction, formData.accountId]);

  // Opções para tipo de transação
  const transactionTypeOptions = [
    { value: TransactionType.INCOME, label: 'Receita' },
    { value: TransactionType.EXPENSE, label: 'Despesa' }
  ];

  // Opções para contas
  const accountOptions = accounts.map(account => ({
    value: account.id.toString(),
    label: account.description
  }));

  // Opções para categorias
  const categoryOptions = categories.map(category => ({
    value: category.id.toString(),
    label: category.name
  }));

  const handleSubmit = async () => {
    try {
      setErrors('');
      
      // Validações básicas
      if (!formData.description.trim()) {
        setErrors('Descrição é obrigatória');
        return;
      }
      
      if (formData.amount <= 0) {
        setErrors('Valor deve ser maior que zero');
        return;
      }

      if (!formData.accountId) {
        setErrors('Conta é obrigatória');
        return;
      }

      if (!formData.date) {
        setErrors('Data é obrigatória');
        return;
      }

      // Prepara os dados para envio
      const submitData: TransactionCreateRequest = {
        ...formData,
        categoryId: formData.categoryId || undefined
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      setErrors('Erro ao salvar transação. Tente novamente.');
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      description: '',
      amount: 0,
      type: TransactionType.EXPENSE,
      categoryId: undefined,
      accountId: accounts.length > 0 ? accounts[0].id : 0,
      date: new Date().toISOString().split('T')[0]
    });
    setErrors('');
    onClose();
  };

  // Utilitário para converter valores de campos de formulário para o tipo correto
  function convertFieldValue(field: keyof TransactionCreateRequest, value: string): string | number | undefined {
    if (field === 'amount') {
      return parseFloat(value) || 0;
    } else if (field === 'accountId' || field === 'categoryId') {
      return value ? parseInt(value) : undefined;
    }
    return value;
  }

  const updateFormData = (field: keyof TransactionCreateRequest) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: convertFieldValue(field, value)
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={transaction ? 'Editar Transação' : 'Nova Transação'}
      size="md"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {errors && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors}
          </div>
        )}

        <FormField
          label="Descrição"
          name="description"
          type="text"
          value={formData.description}
          onChange={updateFormData('description')}
          required
          placeholder="Ex: Compra no supermercado, Salário mensal"
          disabled={isLoading}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Valor"
            name="amount"
            type="number"
            value={formData.amount || 0}
            onChange={updateFormData('amount')}
            required
            placeholder="0.00"
            disabled={isLoading}
          />

          <FormField
            label="Tipo"
            name="type"
            type="select"
            value={formData.type}
            onChange={updateFormData('type')}
            required
            options={transactionTypeOptions}
            disabled={isLoading}
          />
        </div>

        <FormField
          label="Conta"
          name="accountId"
          type="select"
          value={formData.accountId?.toString() || ''}
          onChange={updateFormData('accountId')}
          required
          options={accountOptions}
          disabled={isLoading}
        />

        <FormField
          label="Categoria"
          name="categoryId"
          type="select"
          value={formData.categoryId?.toString() || ''}
          onChange={updateFormData('categoryId')}
          options={categoryOptions}
          disabled={isLoading}
        />

        <FormField
          label="Data"
          name="date"
          type="date"
          value={formData.date}
          onChange={updateFormData('date')}
          required
          disabled={isLoading}
        />

        <FormButtons
          onCancel={handleClose}
          onSubmit={handleSubmit}
          submitLabel={transaction ? 'Atualizar' : 'Criar Transação'}
          isLoading={isLoading}
          disabled={!formData.description.trim() || formData.amount <= 0 || !formData.accountId}
        />
      </form>
    </Modal>
  );
}
