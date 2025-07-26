"use client";

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
  disabled = false 
}: FormFieldProps) {
  const baseClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm";
  const disabledClasses = disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "";

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
            className={`${baseClasses} ${disabledClasses}`}
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
            className={`${baseClasses} ${disabledClasses} resize-none`}
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
            className={`${baseClasses} ${disabledClasses}`}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
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
  return (
    <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
