import { useEffect, RefObject } from 'react';

interface UseFocusTrapProps {
  isOpen: boolean;
  onClose: () => void;
  modalRef: RefObject<HTMLElement | null>;
  isProcessing?: boolean;
}

export function useFocusTrap({ isOpen, onClose, modalRef, isProcessing = false }: UseFocusTrapProps) {
  useEffect(() => {
    // Si el modal no está abierto, no hacemos nada
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Cerrar con Escape (si no está procesando)
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
        return;
      }

      // 2. Trampa de foco con Tabulador
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) { // Shift + Tab (hacia atrás)
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else { // Solo Tab (hacia adelante)
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      }
    };

    // Activamos el listener y bloqueamos el scroll del fondo
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Limpieza al desmontar o cerrar el modal
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, modalRef, isProcessing]);
}