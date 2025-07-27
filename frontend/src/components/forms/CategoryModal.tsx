"use client";

import { useState, useEffect } from 'react';
import { Modal, FormField } from '../ui';
import { Category, CategoryCreateRequest, CategoryUpdateRequest, CATEGORY_TYPE_REVERSE_MAP, CATEGORY_COLORS } from '@/lib/types/category';
import { categoriesService } from '@/lib/services/categoriesService';

interface CategoryModalProps {
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit' | 'delete';
  readonly category?: Category;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export default function CategoryModal({ 
  isOpen, 
  mode, 
  category, 
  onClose, 
  onSuccess 
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryCreateRequest>({
    category: '',
    type: 0,
    color: CATEGORY_COLORS[0] 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (category && (mode === 'edit' || mode === 'delete')) {
      setFormData({
        category: category.category,
        type: CATEGORY_TYPE_REVERSE_MAP[category.type as keyof typeof CATEGORY_TYPE_REVERSE_MAP],
        color: category.color || CATEGORY_COLORS[0]
      });
    } else if (mode === 'create') {
      setFormData({
        category: '',
        type: 0,
        color: CATEGORY_COLORS[0]
      });
    }
    setError('');
  }, [category, mode, isOpen]);

  const handleCreate = async () => {
    try {
      setError('');
      setIsLoading(true);

      if (!formData.category.trim()) {
        setError('Nome da categoria é obrigatório');
        return;
      }

      await categoriesService.create(formData);
      onSuccess();
    } catch (error) {
      setError('Erro ao criar categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!category) return;

    try {
      setError('');
      setIsLoading(true);

      if (!formData.category.trim()) {
        setError('Nome da categoria é obrigatório');
        return;
      }

      const updateData: CategoryUpdateRequest = {
        category: formData.category.trim(),
        type: formData.type,
        color: formData.color
      };

      await categoriesService.update(category.id, updateData);
      onSuccess();
    } catch (error) {
      setError('Erro ao atualizar categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    try {
      setError('');
      setIsLoading(true);

      await categoriesService.delete(category.id);
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir categoria. Tente novamente.';
      setError(errorMessage);
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

  const updateFormData = (field: keyof CategoryCreateRequest) => (value: string) => {
    setFormData(prev => {
      let newValue: string | number = value;
      
      if (field === 'type') {
        newValue = parseInt(value);
      }
      
      return {
        ...prev,
        [field]: newValue
      };
    });
  };

  const getModalTitle = () => {
    if (mode === 'create') return 'Nova Categoria';
    if (mode === 'edit') return 'Editar Categoria';
    if (mode === 'delete') return 'Excluir Categoria';
    return 'Categoria';
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      if (mode === 'create') return 'Criando...';
      if (mode === 'edit') return 'Salvando...';
      if (mode === 'delete') return 'Excluindo...';
    }

    if (mode === 'create') return 'Criar Categoria';
    if (mode === 'edit') return 'Salvar Alterações';
    if (mode === 'delete') return 'Confirmar Exclusão';
    return 'Salvar';
  };

  const getSubmitButtonColor = () => {
    if (mode === 'delete') {
      return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
    return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
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
        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
      >
        Cancelar
      </button>
      <button
        type={mode === 'delete' ? 'button' : 'submit'}
        form={mode === 'delete' ? undefined : 'category-form'}
        onClick={mode === 'delete' ? handleSubmit : undefined}
        disabled={isLoading}
        className={`px-4 py-2 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getSubmitButtonColor()}`}
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
      size="md"
      variant={getModalVariant()}
      footer={renderFooter()}
    >
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {mode === 'delete' ? (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Confirmar Exclusão
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>

          {category && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                Categoria a ser excluída:
              </h5>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">ID:</span> #{category.id}</p>
                <p><span className="font-medium">Nome:</span> {category.category}</p>
                <p><span className="font-medium">Tipo:</span> {category.type === 'IN' ? 'Entrada' : 'Saída'}</p>
                {category.color && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Cor:</span>
                    <span 
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs">{category.color}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form id="category-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <FormField
              label="Nome da Categoria"
              name="category"
              type="text"
              value={formData.category}
              onChange={updateFormData('category')}
              required
              placeholder="Ex: Alimentação, Transporte, Salário"
              disabled={isLoading}
            />

            <div className="space-y-2">
              <label htmlFor="category-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo da Categoria
              </label>
              <select
                id="category-type"
                value={formData.type}
                onChange={(e) => updateFormData('type')(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={0}>Entrada</option>
                <option value={1}>Saída</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="category-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cor da Categoria
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateFormData('color')(color)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      formData.color === color 
                        ? 'border-gray-800 dark:border-white scale-110' 
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    } transition-transform disabled:cursor-not-allowed`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cor selecionada: <span className="font-medium">{formData.color}</span>
              </p>
            </div>
          </form>
        )}
    </Modal>
  );
}
