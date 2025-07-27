"use client";
import { useEffect, useRef } from 'react';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly variant?: 'default' | 'danger' | 'success' | 'warning';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  variant = 'default'
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fecha o modal quando pressiona ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Previne scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
      
      // Focus no modal quando abrir
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Define a largura do painel
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-80'; // 320px
      case 'md':
        return 'w-96'; // 384px
      case 'lg':
        return 'w-[32rem]'; // 512px
      case 'xl':
        return 'w-[40rem]'; // 640px
      default:
        return 'w-96'; // 384px
    }
  };

  // Define as cores do header baseado na variante
  const getHeaderClasses = () => {
    const baseClasses = 'px-6 py-5 border-b border-gray-200 dark:border-gray-600 flex-shrink-0';
    
    switch (variant) {
      case 'danger':
        return `${baseClasses} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800`;
      case 'success':
        return `${baseClasses} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800`;
      default:
        return `${baseClasses} bg-white dark:bg-slate-800`;
    }
  };

  // Define as cores do título baseado na variante
  const getTitleClasses = () => {
    const baseClasses = 'text-lg font-semibold leading-6';
    
    switch (variant) {
      case 'danger':
        return `${baseClasses} text-red-900 dark:text-red-100`;
      case 'success':
        return `${baseClasses} text-green-900 dark:text-green-100`;
      case 'warning':
        return `${baseClasses} text-yellow-900 dark:text-yellow-100`;
      default:
        return `${baseClasses} text-gray-900 dark:text-white`;
    }
  };

  // Define o ícone baseado na variante
  const getVariantIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <dialog 
      open
      className="fixed inset-0 z-50 overflow-hidden bg-transparent"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-500 transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-75' : 'bg-opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Slide Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
        <div 
          ref={modalRef}
          className={`transform transition-all duration-300 ease-in-out ${
            isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } relative z-10 bg-white dark:bg-slate-800 shadow-2xl flex flex-col h-full ${getSizeClasses()}`}
          tabIndex={-1}
        >
          {/* Header */}
          <div className={getHeaderClasses()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getVariantIcon()}
                <h3 
                  className={getTitleClasses()} 
                  id="modal-title"
                >
                  {title}
                </h3>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1 transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Fechar</span>
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-50 dark:bg-slate-700 px-6 py-5 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
