"use client";

import { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '@/lib/types/transaction';
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';
import { transactionsService } from '@/lib/services/transactionsService';
import { accountsService } from '@/lib/services/accountsService';
import { categoriesService } from '@/lib/services/categoriesService';
import TransactionModal from '@/components/forms/TransactionModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete' | 'settle';
    transaction?: Transaction;
  }>({
    isOpen: false,
    mode: 'create'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Carregando dados da API...');
      
      const [transactionsData, accountsData, categoriesData] = await Promise.all([
        transactionsService.getAll(),
        accountsService.getAll(),
        categoriesService.getAll()
      ]);
      
      console.log('Dados carregados:', { transactionsData, accountsData, categoriesData });
      setTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'delete' | 'settle', transaction?: Transaction) => {
    setModalState({
      isOpen: true,
      mode,
      transaction
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create'
    });
  };

  const handleModalSuccess = () => {
    closeModal();
    loadData(); // Recarregar a lista após operação bem-sucedida
  };

  // Função para obter nome da conta
  const getAccountName = (accountId: number): string => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.description || 'Conta não encontrada';
  };

  // Função para obter nome da categoria
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.category || 'Categoria não encontrada';
  };

  // Função para gerar cor baseada no tipo de transação
  const getTransactionTypeColor = (type: TransactionType): string => {
    return type === TransactionType.INCOME 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    
    // Se a data já está no formato DD/MM/YYYY (do backend), apenas retorna
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Se está no formato ISO (YYYY-MM-DD), converte para DD/MM/YYYY
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 dark:text-gray-400">Carregando transações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciar Transações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualize e gerencie todas as suas receitas e despesas
          </p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          + Adicionar Nova Transação
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button
            onClick={loadData}
            className="ml-4 text-red-800 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Nenhuma transação encontrada
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Comece adicionando sua primeira receita ou despesa.
            </p>
            <button
              onClick={() => openModal('create')}
              className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Adicionar Primeira Transação
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-2">Descrição</div>
              <div className="col-span-1">Categoria</div>
              <div className="col-span-1">Tipo</div>
              <div className="col-span-1">Valor</div>
              <div className="col-span-1">Conta</div>
              <div className="col-span-2">Vencimento</div>
              <div className="col-span-2">Data Efetiva</div>
              <div className="col-span-1">Valor Efetivo</div>
              <div className="col-span-1">Ações</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Descrição */}
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {transaction.description}
                    </p>
                  </div>

                  {/* Categoria */}
                  <div className="col-span-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {getCategoryName(transaction.categoryId)}
                    </span>
                  </div>

                  {/* Tipo */}
                  <div className="col-span-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                    </span>
                  </div>

                  {/* Valor */}
                  <div className="col-span-1">
                    <span className={`text-sm font-medium ${
                      transaction.type === TransactionType.INCOME 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Conta */}
                  <div className="col-span-1">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {getAccountName(transaction.accountId)}
                    </p>
                  </div>

                  {/* Data de Vencimento */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(transaction.dueDate)}
                    </p>
                  </div>

                  {/* Data Efetiva */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.effectiveDate ? formatDate(transaction.effectiveDate) : '-'}
                    </p>
                  </div>

                  {/* Valor Efetivo */}
                  <div className="col-span-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.effectiveAmount ? 
                        `R$ ${transaction.effectiveAmount.toFixed(2).replace('.', ',')}` : 
                        '-'
                      }
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="col-span-1">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openModal('edit', transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar transação"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {!transaction.effectiveDate && (
                        <button
                          onClick={() => openModal('settle', transaction)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Liquidar transação"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => openModal('delete', transaction)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir transação"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <TransactionModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        transaction={modalState.transaction}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
