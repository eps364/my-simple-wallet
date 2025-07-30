"use client";

import React, { useState, useEffect, useRef } from 'react';
  
import { Modal, FormField } from '../ui';
// import { transactionsService } from '@/lib/services/transactionsService';
import { loanService } from '@/lib/services/loanService';
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';
import { User } from '@/lib/types/user';
import { TransactionType } from '@/lib/types/transaction';


interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: unknown) => void;
  accounts: Account[];
  categories: Category[];
  currentUser: User | null;
}

export default function LoanModal({ isOpen, onClose, onSuccess, accounts, categories }: LoanModalProps) {
  const [form, setForm] = useState({
    description: 'Emprestimo',
    amount: '',
    type: TransactionType.INCOME, // Não editável
    dueDate: '',
    effectiveDate: '',
    accountId: '',
    categoryId: '',
    descriptionLoan: 'Emprestimo',
    qtdeInstallments: '1',
    amountInstallment: '',
    typeLoan: TransactionType.EXPENSE, // Não editável
    accountIdLoan: '',
    categoryIdLoan: '',
    dueDateLoan: '',
  });

  
  const [loading, setLoading] = useState(false);
  const [installments, setInstallments] = useState<{ dueDate: string; amount: number }[]>([]);
  const [error, setError] = useState<string>('');
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      const userId = typeof window !== 'undefined' ? window.localStorage.getItem('userId') : '';
      // Conta do usuário logado
      const userAccounts = (accounts ?? []).filter(acc => String(acc.userId) === String(userId));
      const userAccountId = userAccounts.length > 0 ? userAccounts[0].id.toString() : '';
      // Categoria IN para entrada
      const userCategoriesIN = (categories ?? []).filter(cat => cat.type === 'IN' && String(cat.userId) === String(userId));
      const userCategoryIdIN = userCategoriesIN.length > 0 ? userCategoriesIN[0].id.toString() : '';
      // Categoria EX para empréstimo
      const userCategoriesEX = (categories ?? []).filter(cat => cat.type === 'EX' && String(cat.userId) === String(userId));
      const userCategoryIdEX = userCategoriesEX.length > 0 ? userCategoriesEX[0].id.toString() : '';
      setForm({
        description: 'Emprestimo',
        amount: '',
        type: TransactionType.INCOME,
        dueDate: today,
        effectiveDate: today,
        accountId: userAccountId,
        categoryId: userCategoryIdIN,
        descriptionLoan: 'Emprestimo',
        qtdeInstallments: '1',
        amountInstallment: '',
        typeLoan: TransactionType.EXPENSE,
        accountIdLoan: userAccountId,
        categoryIdLoan: userCategoryIdEX,
        dueDateLoan: '',
      });
      setError('');
      setInstallments([]);
      setTimeout(() => {
        amountRef.current?.focus();
      }, 100);
    }
  }, [isOpen, accounts, categories]);

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        type: 0,
        accountId: parseInt(form.accountId),
        categoryId: parseInt(form.categoryId),
        description: form.description,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate,
        effectiveDate: form.effectiveDate,
        typeLoan: 1,
        accountIdLoan: parseInt(form.accountIdLoan),
        categoryIdLoan: parseInt(form.categoryIdLoan),
        descriptionLoan: form.descriptionLoan,
        amountInstallment: parseFloat(form.amountInstallment),
        qtdeInstallments: parseInt(form.qtdeInstallments),
        dueDateLoan: form.dueDateLoan || '',
      };
      // Chamada correta para o endpoint de empréstimo
      const response: any = await loanService.createLoan(payload);
      setInstallments(response.installments || []);
      onSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empréstimo');
    } finally {
      setLoading(false);
    }
  };

  const renderFooter = () => (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        disabled={loading}
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="loan-form"
        disabled={loading}
        className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
      >
        {loading ? "Processando..." : "Lançar"}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lançar Empréstimo"
      size="lg"
      variant="default"
      footer={renderFooter()}
    >
      <form id="loan-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tipo (oculto) */}
        <input type="hidden" name="type" value={form.type} />
        <div className="flex gap-4">
          <div className="flex-1">
            <FormField
              label="Conta"
              name="accountId"
              type="select"
              value={form.accountId}
              onChange={value => handleChange('accountId', value)}
              options={
                (accounts ?? []).map(account => ({ value: account.id.toString(), label: account.description }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <FormField
              label="Categoria"
              name="categoryId"
              type="select"
              value={form.categoryId}
              onChange={value => handleChange('categoryId', value)}
              options={
                (categories ?? [])
                  .filter(category => category.type === 'IN')
                  .map(category => ({ value: category.id.toString(), label: category.category }))
              }
              required
            />
          </div>
        </div>
        <FormField
          label="Descrição"
          name="description"
          type="text"
          value={form.description || 'Emprestimo'}
          onChange={value => handleChange('description', value)}
          required
        />
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Valor
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              required
              ref={amountRef}
              value={form.amount}
              onChange={e => handleChange('amount', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <FormField
              label="Crédito em:"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={value => handleChange('dueDate', value)}
              required
            />
          </div>
        </div>
        {/* effectiveDate oculto, igual ao Vencimento */}
        <input type="hidden" name="effectiveDate" value={form.dueDate} />
        <hr className="my-6 border-t border-gray-300" />
        {/* Tipo Empréstimo (oculto) */}
        <input type="hidden" name="typeLoan" value={form.typeLoan} />
        <div className="flex gap-4">
          <div className="flex-1">
            <FormField
              label="Conta Empréstimo"
              name="accountIdLoan"
              type="select"
              value={form.accountIdLoan}
              onChange={value => handleChange('accountIdLoan', value)}
              options={
                (accounts ?? []).map(account => ({ value: account.id.toString(), label: account.description }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <FormField
              label="Categoria Empréstimo"
              name="categoryIdLoan"
              type="select"
              value={form.categoryIdLoan}
              onChange={value => handleChange('categoryIdLoan', value)}
              options={
                (categories ?? [])
                  .filter(category => category.type === 'EX')
                  .map(category => ({ value: category.id.toString(), label: category.category }))
              }
              required
            />
          </div>
        </div>
        <FormField
          label="Descrição do Empréstimo"
          name="descriptionLoan"
          type="text"
          value={form.descriptionLoan || form.description || 'Emprestimo'}
          onChange={value => handleChange('descriptionLoan', value)}
          required
        />
        <div className="flex gap-4">
          <div className="flex-1">
            <FormField
              label="Valor Parcela"
              name="amountInstallment"
              type="number"
              value={form.amountInstallment}
              onChange={value => handleChange('amountInstallment', value)}
              required
            />
          </div>
          <div className="flex-1">
            <FormField
              label="Qtd Parcelas"
              name="qtdeInstallments"
              type="number"
              value={form.qtdeInstallments}
              onChange={value => handleChange('qtdeInstallments', value)}
              required
            />
          </div>
        </div>
        <FormField
          label="Vencimento 1ª Parcela"
          name="dueDateLoan"
          type="date"
          value={form.dueDateLoan}
          onChange={value => handleChange('dueDateLoan', value)}
          required
        />
        {/* Campo oculto: effectiveAmountLoan recebe amountInstallment */}
        <input type="hidden" name="effectiveAmountLoan" value={form.amountInstallment} />

        {installments.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Parcelas Geradas</h3>
            <ul className="space-y-1">
              {installments.map((inst, index) => (
                <li key={index} className="text-sm">
                  {inst.dueDate} - R$ {inst.amount.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </Modal>
  );
}