import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
// Importamos el hook de focus trap (Ajusta la ruta según la ubicación real en tu proyecto)
import { useFocusTrap } from '@/hooks/useFocusTrap'; 

interface ConfirmActionModalProps {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  message: string;
  icon?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'primary';
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmActionModal = ({
  isOpen,
  isLoading,
  title,
  message,
  icon,
  confirmText,
  cancelText,
  variant = 'primary',
  onClose,
  onConfirm
}: ConfirmActionModalProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  // 1. a11y: Encapsulamos el tabulador dentro del modal
  useFocusTrap({isOpen, onClose, modalRef});

  // 2. a11y: Permitimos cerrar el modal con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // 3. i18n: Resolvemos los textos por defecto usando el traductor
  const finalConfirmText = confirmText || t('modal.confirmar', 'Confirmar');
  const finalCancelText = cancelText || t('modal.cancelar', 'Cancelar');

  const titleColor = 
    variant === 'danger' ? 'text-red-600' : 
    variant === 'success' ? 'text-green-600' : 
    'text-blue-600';

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Contenedor del Modal */}
      <div 
        ref={modalRef}
        // a11y: Roles ARIA estructurales para la ventana emergente
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 relative animate-in zoom-in-95 duration-200"
      >
        
        {/* a11y: El id debe coincidir con aria-labelledby */}
        <h3 id="modal-title" className={`text-xl font-bold mb-2 flex items-center gap-2 ${titleColor}`}>
          {/* a11y: Silenciamos el icono */}
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h3>
        
        {/* a11y: El id debe coincidir con aria-describedby */}
        <p id="modal-description" className="text-gray-600 mb-6 text-sm">
          {message}
        </p>
        
        <div className="flex justify-end gap-3 mt-8">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isLoading}
            autoFocus
          >
            {finalCancelText}
          </Button>
          
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <>
                <span aria-hidden="true" className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                {/* a11y: Texto invisible para el lector de pantalla mientras carga */}
                <span className="sr-only">{t('modal.cargando', 'Cargando...')}</span>
              </>
            ) : (
              finalConfirmText
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};