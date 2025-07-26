"use client";
import { useEffect, useRef } from 'react';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
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
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Define o tamanho do modal
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <dialog 
      open
      className="fixed inset-0 z-50 overflow-y-auto bg-transparent"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div className="flex items-center justify-center min-h-screen py-4 px-4 text-center">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div 
          ref={modalRef}
          className={`inline-block bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full ${getSizeClasses()} relative z-10 my-8 max-h-[90vh] overflow-y-auto`}
        >
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 dark:border-gray-600 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <h3 
                className="text-lg leading-6 font-medium text-gray-900 dark:text-white" 
                id="modal-title"
              >
                {title}
              </h3>
              <button
                type="button"
                className="bg-white dark:bg-slate-800 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <span className="sr-only">Fechar</span>
                <svg 
                  className="h-6 w-6" 
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
          <div className="bg-white dark:bg-slate-800 px-4 py-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
}
