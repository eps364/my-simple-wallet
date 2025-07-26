"use client";
import { useState } from 'react';
import { Modal, FormField, FormButtons } from '../ui';
import { Category, CategoryCreateRequest, CATEGORY_COLORS } from '@/lib/types/category';

interface CategoryFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: CategoryCreateRequest) => Promise<void>;
  readonly category?: Category;
  readonly isLoading?: boolean;
}

export default function CategoryForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category, 
  isLoading = false 
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryCreateRequest>({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || CATEGORY_COLORS[0]
  });

  const [errors, setErrors] = useState<string>('');

  const handleSubmit = async () => {
    try {
      setErrors('');
      
      // Validações básicas
      if (!formData.name.trim()) {
        setErrors('Nome da categoria é obrigatório');
        return;
      }

      await onSubmit(formData);
      handleClose();
    } catch (error) {
      setErrors('Erro ao salvar categoria. Tente novamente.');
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      color: CATEGORY_COLORS[0]
    });
    setErrors('');
    onClose();
  };

  const updateFormData = (field: keyof CategoryCreateRequest) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={category ? 'Editar Categoria' : 'Nova Categoria'}
      size="md"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {errors && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors}
          </div>
        )}

        <FormField
          label="Nome da Categoria"
          name="name"
          type="text"
          value={formData.name}
          onChange={updateFormData('name')}
          required
          placeholder="Ex: Alimentação, Transporte, Lazer"
          disabled={isLoading}
        />

        <FormField
          label="Descrição"
          name="description"
          type="textarea"
          value={formData.description || ''}
          onChange={updateFormData('description')}
          placeholder="Descrição opcional da categoria"
          rows={3}
          disabled={isLoading}
        />

        {/* Seletor de Cor */}
        <div className="mb-4">
          <label htmlFor="color-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cor da Categoria
          </label>
          <div id="color-selector" className="flex flex-wrap gap-2" role="radiogroup" aria-label="Selecionar cor da categoria">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateFormData('color')(color)}
                disabled={isLoading}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.color === color
                    ? 'border-gray-800 dark:border-white shadow-lg'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Selecionar cor ${color}`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: formData.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Cor selecionada: {formData.color}
            </span>
          </div>
        </div>

        <FormButtons
          onCancel={handleClose}
          onSubmit={handleSubmit}
          submitLabel={category ? 'Atualizar' : 'Criar Categoria'}
          isLoading={isLoading}
          disabled={!formData.name.trim()}
        />
      </form>
    </Modal>
  );
}
