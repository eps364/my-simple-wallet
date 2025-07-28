"use client";
import { useEffect, useRef } from 'react';
import { useThemeStyles } from '@/lib/hooks/useThemeStyles';

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
  const styles = useThemeStyles();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
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

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-80'; 
      case 'md':
        return 'w-96'; 
      case 'lg':
        return 'w-[32rem]'; 
      case 'xl':
        return 'w-[40rem]'; 
      default:
        return 'w-96'; 
    }
  };

  const getHeaderStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      ...styles.surface,
      borderBottomColor: styles.border.borderColor,
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid' as const
    };
    
    switch (variant) {
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-error)',
          color: 'white',
          opacity: 0.1
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-success)',
          color: 'white',
          opacity: 0.1
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-warning)',
          color: 'white',
          opacity: 0.1
        };
      default:
        return baseStyle;
    }
  };

  const getTitleStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      color: styles.text.color,
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: '1.5'
    };
    
    switch (variant) {
      case 'danger':
        return { ...baseStyle, color: 'var(--color-error)' };
      case 'success':
        return { ...baseStyle, color: 'var(--color-success)' };
      case 'warning':
        return { ...baseStyle, color: 'var(--color-warning)' };
      default:
        return baseStyle;
    }
  };

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
      
      <div 
        className={`fixed inset-0 bg-gray-500 transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-75' : 'bg-opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      ></div>

      
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
        <div 
          ref={modalRef}
          style={{
            ...styles.surface,
            borderColor: styles.border.borderColor,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          className={`transform transition-all duration-300 ease-in-out ${
            isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } relative z-10 border shadow-2xl flex flex-col h-full ${getSizeClasses()}`}
          tabIndex={-1}
        >
          
          <div 
            style={getHeaderStyle()}
            className="px-6 py-5 flex-shrink-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getVariantIcon()}
                <h3 
                  style={getTitleStyle()}
                  id="modal-title"
                >
                  {title}
                </h3>
              </div>
              <button
                type="button"
                style={{
                  color: styles.textMuted.color
                }}
                className="hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md p-1 transition-all"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
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

          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </div>

          
          {footer && (
            <div 
              style={{
                backgroundColor: styles.background.backgroundColor,
                borderTopColor: styles.border.borderColor,
                borderTopWidth: '1px',
                borderTopStyle: 'solid' as const
              }}
              className="px-6 py-5 flex-shrink-0"
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
