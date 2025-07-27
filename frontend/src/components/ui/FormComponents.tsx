"use client";

import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

interface FormFieldProps {
  readonly label: string;
  readonly name: string;
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  readonly value: string | number;
  readonly onChange: (value: string) => void;
  readonly required?: boolean;
  readonly placeholder?: string;
  readonly options?: Array<{ value: string | number; label: string }>;
  readonly rows?: number;
  readonly disabled?: boolean;
  readonly labelExtra?: React.ReactNode;
}

export function FormField({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  required = false, 
  placeholder, 
  options, 
  rows = 3,
  disabled = false,
  labelExtra
}: FormFieldProps) {
  const styles = useThemeStyles();
  
  const baseStyle = {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
    borderWidth: '1px',
    borderStyle: 'solid'
  };
  
  const disabledStyle = disabled ? {
    backgroundColor: 'var(--color-background)',
    opacity: 0.6,
    cursor: 'not-allowed'
  } : {};

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            style={{
              ...baseStyle,
              ...disabledStyle
            }}
            className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Selecione uma opção</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              ...baseStyle,
              ...disabledStyle,
              resize: 'none'
            }}
            className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        );

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              ...baseStyle,
              ...disabledStyle
            }}
            className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={name} style={{ color: styles.text.color }} className="block text-sm font-medium">
          {label}
          {required && <span style={{ color: 'var(--color-error)' }} className="ml-1">*</span>}
        </label>
        {labelExtra && (
          <div className="text-sm">
            {labelExtra}
          </div>
        )}
      </div>
      {renderInput()}
    </div>
  );
}

interface FormButtonsProps {
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
  readonly submitLabel?: string;
  readonly cancelLabel?: string;
  readonly isLoading?: boolean;
  readonly disabled?: boolean;
}

export function FormButtons({ 
  onCancel, 
  onSubmit, 
  submitLabel = "Salvar", 
  cancelLabel = "Cancelar",
  isLoading = false,
  disabled = false
}: FormButtonsProps) {
  const styles = useThemeStyles();
  
  return (
    <div style={{ borderColor: styles.border.borderColor }} className="flex justify-end space-x-3 pt-6 mt-6 border-t">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        style={{
          ...styles.surface,
          borderColor: styles.border.borderColor,
          color: styles.text.color
        }}
        className="px-4 py-2 text-sm font-medium border rounded-md shadow-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'var(--color-background)';
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
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isLoading}
        style={{
          backgroundColor: 'var(--color-primary)',
          borderColor: 'transparent',
          color: 'white'
        }}
        className="px-4 py-2 text-sm font-medium border rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        onMouseEnter={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}
