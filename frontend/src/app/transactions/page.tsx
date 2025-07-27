"use client";

import { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '@/lib/types/transaction';
import { Account } from '@/lib/types/account';
import { Category } from '@/lib/types/category';
import { User } from '@/lib/types/user';
import { transactionsService } from '@/lib/services/transactionsService';
import { accountsService } from '@/lib/services/accountsService';
import { categoriesService } from '@/lib/services/categoriesService';
import { usersService } from '@/lib/services/usersService';
import { useFamilyManagement } from '@/lib/hooks/useParentMonitoring';
import TransactionModal from '@/components/forms/TransactionModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'liquidated' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'description' | 'category' | 'status' | 'effectiveDate'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { isManagementEnabled } = useFamilyManagement();
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

  // Recarregar dados quando o gerenciamento familiar for alterado
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [isManagementEnabled]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Carregando dados da API...');
      
      // Enviar isParent=true quando o gerenciamento familiar estiver ativo
      const shouldUseParentMode = isManagementEnabled;
      console.log('Gerenciamento Familiar ativo:', shouldUseParentMode);
      
      const [transactionsData, accountsData, categoriesData, userData] = await Promise.all([
        transactionsService.getAll(shouldUseParentMode),
        accountsService.getAll(shouldUseParentMode),
        categoriesService.getAll(shouldUseParentMode),
        usersService.getProfile()
      ]);
      
      console.log('Dados carregados:', { transactionsData, accountsData, categoriesData, userData });
      setTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setCurrentUser(userData);
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

  // Verificar se uma transação pode ser editada/deletada (apenas transações do usuário logado)
  const canEditTransaction = (transaction: Transaction): boolean => {
    return currentUser ? transaction.username === currentUser.username : false;
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

  // Função para filtrar transações
  const getFilteredTransactions = (): Transaction[] => {
    switch (statusFilter) {
      case 'liquidated':
        return transactions.filter(transaction => transaction.effectiveDate);
      case 'pending':
        return transactions.filter(transaction => !transaction.effectiveDate);
      default:
        return transactions;
    }
  };

  const getSortedTransactions = (transactionsToSort: Transaction[]): Transaction[] => {
    const parseDate = (dateString: string | undefined): number => {
      if (!dateString) return 0;
      
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
      }
      
      return new Date(dateString).getTime();
    };

    return [...transactionsToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dueDate':
          comparison = parseDate(a.dueDate) - parseDate(b.dueDate);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'category': {
          const categoryA = getCategoryName(a.categoryId);
          const categoryB = getCategoryName(b.categoryId);
          comparison = categoryA.localeCompare(categoryB);
          break;
        }
        case 'status': {
          const statusA = a.effectiveDate ? 1 : 0; // liquidada = 1, pendente = 0
          const statusB = b.effectiveDate ? 1 : 0;
          comparison = statusA - statusB;
          break;
        }
        case 'effectiveDate':
          comparison = parseDate(a.effectiveDate) - parseDate(b.effectiveDate);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const getEmptyStateTexts = () => {
    if (transactions.length === 0) {
      return {
        title: 'Nenhuma transação encontrada',
        description: 'Comece adicionando sua primeira receita ou despesa.',
        showButton: true
      };
    }

    let statusText = '';
    if (statusFilter === 'liquidated') {
      statusText = 'liquidada';
    } else if (statusFilter === 'pending') {
      statusText = 'pendente';
    }

    const oppositeText = statusFilter === 'liquidated' ? 'transações pendentes' : 'transações liquidadas';
    
    return {
      title: `Nenhuma transação ${statusText} encontrada`,
      description: `Altere o filtro para ver ${oppositeText} ou todas as transações.`,
      showButton: false
    };
  };

  const filteredTransactions = getFilteredTransactions();
  const sortedAndFilteredTransactions = getSortedTransactions(filteredTransactions);

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

      {/* Filter and Sort Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar por status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'liquidated' | 'pending')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Todas as Transações</option>
            <option value="liquidated">Liquidadas</option>
            <option value="pending">Pendentes</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ordenar por:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'amount' | 'description' | 'category' | 'status' | 'effectiveDate')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="dueDate">Data de Vencimento</option>
            <option value="amount">Valor</option>
            <option value="description">Descrição</option>
            <option value="category">Categoria</option>
            <option value="status">Status</option>
            <option value="effectiveDate">Data Efetiva</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
            title={`Ordenação ${sortOrder === 'asc' ? 'crescente' : 'decrescente'} - Clique para alternar`}
          >
            {sortOrder === 'asc' ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                A-Z
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Z-A
              </>
            )}
          </button>
        </div>

        {/* Results Counter */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 lg:ml-auto">
          <span>
            Mostrando {sortedAndFilteredTransactions.length} de {transactions.length} transações
          </span>
        </div>
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
      {sortedAndFilteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {getEmptyStateTexts().title}
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {getEmptyStateTexts().description}
            </p>
            {getEmptyStateTexts().showButton && (
              <button
                onClick={() => openModal('create')}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Adicionar Primeira Transação
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedAndFilteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {transaction.description}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {getAccountName(transaction.accountId)}
                  </p>
                </div>
                {/* <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTransactionTypeColor(transaction.type)}`}>
                  {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                </span> */}
              </div>

              {/* Main Amount */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Valor</span>
                  <span className={`text-2xl font-bold ${
                    transaction.type === TransactionType.INCOME 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Categoria</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {getCategoryName(transaction.categoryId)}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Vencimento</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(transaction.dueDate)}
                  </span>
                </div>
                {transaction.effectiveDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Data Efetiva</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(transaction.effectiveDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Effective Amount (if different) */}
              {transaction.effectiveAmount && transaction.effectiveAmount !== transaction.amount && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Valor Efetivo</span>
                    <span className={`text-sm font-medium ${
                      transaction.type === TransactionType.INCOME 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      R$ {transaction.effectiveAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="mb-4">
                {transaction.effectiveDate ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Liquidada
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Pendente
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                {/* Username (lado esquerdo) */}
                <div className="flex items-center min-w-0">
                  {isManagementEnabled && currentUser?.isParent && transaction.username && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {transaction.username}
                    </span>
                  )}
                </div>

                {/* Botões de ação (lado direito) */}
                <div className="flex space-x-2">
                  {canEditTransaction(transaction) ? (
                    <>
                      <button
                        onClick={() => openModal('edit', transaction)}
                        className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center"
                        title="Editar transação"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      {!transaction.effectiveDate && (
                        <button
                          onClick={() => openModal('settle', transaction)}
                          className="px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center justify-center"
                          title="Liquidar transação"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Liquidar
                        </button>
                      )}
                      <button
                        onClick={() => openModal('delete', transaction)}
                        className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir transação"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Apenas Visualização
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
