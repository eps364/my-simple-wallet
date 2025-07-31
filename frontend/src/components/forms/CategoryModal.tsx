"use client";

import { useThemeStyles } from '@/lib/hooks/useThemeStyles';
import { categoriesService } from '@/lib/services/categoriesService';
import { Category, CATEGORY_COLORS, CATEGORY_TYPE_REVERSE_MAP, CategoryCreateRequest, CategoryUpdateRequest } from '@/lib/types/category';
import { useEffect, useState } from 'react';
import { FormField, Modal } from '../ui';
import { FormFeedback } from '../ui/FormFeedback';
import { SubmitButton } from '../ui/SubmitButton';

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
  const styles = useThemeStyles();

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
    } catch {
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
    } catch {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir categoria. Tente novamente.';
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
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = styles.background.backgroundColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = styles.surface.backgroundColor;
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = styles.border.borderColor;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Cancelar
      </button>
      <button
        type={mode === 'delete' ? 'button' : 'submit'}
        form={mode === 'delete' ? undefined : 'category-form'}
        onClick={mode === 'delete' ? handleSubmit : undefined}
        disabled={isLoading}
        style={{
          backgroundColor: mode === 'delete' ? 'var(--color-error)' : 'var(--color-primary)',
          color: 'white'
        }}
        className="px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all hover:opacity-90"
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = mode === 'delete' ? 'var(--color-error)' : 'var(--color-primary-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = mode === 'delete' ? 'var(--color-error)' : 'var(--color-primary)';
          }
        }}
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
        <div className="mb-6">
          <FormFeedback message={error} type="error" />
        </div>
      )}

      {mode === 'delete' ? (
        <div className="space-y-6">
          <div
            style={{
              backgroundColor: 'var(--color-warning)',
              borderColor: 'var(--color-warning)',
              opacity: 0.1
            }}
            className="p-4 border rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <svg
                style={{ color: 'var(--color-warning)' }}
                className="w-6 h-6 mt-0.5 flex-shrink-0"
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
                  Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>

          {category && (
            <div
              style={{
                ...styles.background,
                borderColor: styles.border.borderColor
              }}
              className="rounded-lg p-4 border"
            >
              <h5
                style={{ color: styles.text.color }}
                className="font-medium mb-3"
              >
                Categoria a ser excluída:
              </h5>
              <div
                style={{ color: styles.textSecondary.color }}
                className="space-y-2 text-sm"
              >
                <p><span className="font-medium">ID:</span> #{category.id}</p>
                <p><span className="font-medium">Nome:</span> {category.category}</p>
                <p><span className="font-medium">Tipo:</span> {category.type === 'IN' ? 'Entrada' : 'Saída'}</p>
                {category.color && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Cor:</span>
                    <div
                      style={{
                        backgroundColor: category.color,
                        borderColor: styles.border.borderColor
                      }}
                      className="w-4 h-4 rounded-full border"
                    />
                    <span
                      style={{ color: styles.textMuted.color }}
                      className="font-mono"
                    >
                      {category.color}
                    </span>
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

          <FormField
            label="Tipo da Categoria"
            name="type"
            type="select"
            value={formData.type}
            onChange={updateFormData('type')}
            options={[
              { value: 0, label: 'Entrada' },
              { value: 1, label: 'Saída' }
            ]}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <label
              htmlFor="category-color"
              style={{ color: styles.text.color }}
              className="block text-sm font-medium"
            >
              Cor da Categoria
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateFormData('color')(color)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: color,
                    borderColor: formData.color === color
                      ? styles.text.color
                      : styles.border.borderColor,
                    borderWidth: '2px',
                    borderStyle: 'solid'
                  }}
                  className={`w-8 h-8 rounded-full focus:outline-none transition-transform disabled:cursor-not-allowed ${formData.color === color
                      ? 'scale-110'
                      : 'hover:scale-105'
                    }`}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                  title={color}
                />
              ))}
            </div>
            <p
              style={{ color: styles.textMuted.color }}
              className="text-xs"
            >
              Cor selecionada: <span className="font-medium">{formData.color}</span>
            </p>
          </div>

          <SubmitButton label={getSubmitButtonText()} loading={isLoading} />
        </form>
      )}
    </Modal>
  );
}
