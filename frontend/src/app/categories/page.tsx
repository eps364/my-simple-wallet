
"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Category } from '@/lib/types/category';
import { categoriesService } from '@/lib/services/categoriesService';
import { CategoryModal } from '@/components/forms';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';
import { usersService } from '@/lib/services/usersService';

type ModalMode = 'create' | 'edit' | 'delete' | null;

function CategoriesPageContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const styles = useThemeStyles();

  const getFamilyManagementEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('familyManagementEnabled');
    return stored === 'true';
  };

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const user = await usersService.getProfile();
      const shouldUseParentMode = getFamilyManagementEnabled();
      const categoriesData = await categoriesService.getAll(shouldUseParentMode);
      const myCategories = categoriesData.filter(cat => String(cat.userId) === user.id);
      setCategories(myCategories);
    } catch {
      setError('Erro ao carregar categorias. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const getCategoryColor = (id: number): string => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    return colors[id % colors.length];
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: styles.background.backgroundColor }} className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <svg style={{ color: 'var(--color-primary)' }} className="animate-spin h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p style={{ color: styles.textMuted.color }}>Carregando categorias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: styles.background.backgroundColor }} className="container mx-auto px-4 py-8 min-h-screen max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ color: styles.text.color }} className="text-3xl font-bold">Gerenciar Categorias</h1>
          <p style={{ color: styles.textSecondary.color }} className="mt-2">Visualize e gerencie todas as suas categorias de receitas e despesas</p>
        </div>
        <button
          onClick={() => setModalMode('create')}
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          className="px-6 py-3 font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
        >
          + Adicionar Nova Categoria
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)', color: 'white', opacity: 0.9 }} className="mb-6 p-4 border rounded-lg">
          {error}
          <button onClick={loadCategories} style={{ color: 'white', textDecoration: 'underline' }} className="ml-4 hover:no-underline">Tentar novamente</button>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg style={{ color: styles.textMuted.color }} className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 style={{ color: styles.text.color }} className="mt-4 text-lg font-medium">Nenhuma categoria encontrada</h3>
            <p style={{ color: styles.textSecondary.color }} className="mt-2">Comece adicionando sua primeira categoria para organizar suas transações.</p>
            <button onClick={() => setModalMode('create')} style={{ backgroundColor: 'var(--color-primary)', color: 'white' }} className="mt-6 px-6 py-3 font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all">Adicionar Primeira Categoria</button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              style={{
                ...styles.surface,
                borderColor: styles.border.borderColor,
                borderLeftColor: category.color || 'var(--color-primary)',
                borderLeftWidth: '4px',
                borderLeftStyle: 'solid',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              className="rounded-lg border p-6 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {category.color && (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600" style={{ backgroundColor: category.color }} title={`Cor: ${category.color}`} />
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(category.id)}`}>#{category.id}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => { setModalMode('edit'); setSelectedCategory(category); }}
                    style={{ color: 'var(--color-primary)', backgroundColor: 'transparent' }}
                    className="p-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { setModalMode('delete'); setSelectedCategory(category); }}
                    style={{ color: 'var(--color-error)', backgroundColor: 'transparent' }}
                    className="p-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <h3 style={{ color: styles.text.color }} className="text-lg font-semibold truncate">{category.category}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span style={{ color: styles.textSecondary.color }} className="text-sm">Tipo:</span>
                    <span
                      style={{
                        backgroundColor: category.type === 'IN' ? 'var(--color-success)' : 'var(--color-error)',
                        color: 'white',
                        borderColor: category.type === 'IN' ? 'var(--color-success)' : 'var(--color-error)'
                      }}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                    >
                      {category.type === 'IN' ? 'Entrada' : 'Saída'}
                    </span>
                  </div>
                  {category.color && (
                    <div className="flex justify-between items-center">
                      <span style={{ color: styles.textSecondary.color }} className="text-sm">Cor:</span>
                      <div className="flex items-center gap-2">
                        <div style={{ backgroundColor: category.color, borderColor: styles.border.borderColor }} className="w-4 h-4 rounded-full border" />
                        <span style={{ color: styles.textMuted.color }} className="text-xs font-mono">{category.color}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={modalMode !== null}
        mode={modalMode || 'create'}
        category={selectedCategory || undefined}
        onClose={() => { setModalMode(null); setSelectedCategory(null); }}
        onSuccess={loadCategories}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesPageContent />
    </Suspense>
  );
}
