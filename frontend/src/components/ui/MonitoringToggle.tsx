interface MonitoringToggleProps {
  readonly isEnabled: boolean;
  readonly onToggle: (enabled: boolean) => void;
  readonly className?: string;
  readonly disabled?: boolean;
}

export function MonitoringToggle({ 
  isEnabled, 
  onToggle, 
  className = '', 
  disabled = false 
}: MonitoringToggleProps) {
  return (
    <button
      onClick={() => !disabled && onToggle(!isEnabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isEnabled 
          ? 'bg-green-600' 
          : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      title={isEnabled ? 'Gerenciamento Ativo' : 'Gerenciamento Inativo'}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isEnabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
