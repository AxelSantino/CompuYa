import React, { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
// Importamos el hook de focus trap
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ErrorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

export const ErrorDetailModal = ({ isOpen, onClose, errorMessage }: ErrorDetailModalProps) => {
  const { t } = useTranslation();
  
  // Referencia para el contenedor principal del modal
  const modalRef = useRef<HTMLDivElement>(null);

  // a11y: Atrapamos el foco dentro del modal
  useFocusTrap({ isOpen, onClose, modalRef });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        // a11y: Semántica de ventana emergente
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative zoom-in duration-200"
      >
        
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
          {/* a11y: Vinculación del id con el aria-labelledby */}
          <h3 id="error-modal-title" className="text-lg font-bold text-red-800 flex items-center gap-2">
            {/* a11y: Icono decorativo silenciado */}
            <FaExclamationTriangle aria-hidden="true" className="text-red-600" />
            {t('notificationsPage.detalle_error', 'Detalle del Error')}
          </h3>
          <button 
            onClick={onClose} 
            // a11y: Etiqueta, mejora de contraste a red-600 y focus visible
            aria-label={t('notificationsPage.aria_cerrar_modal', 'Cerrar modal')}
            className="text-red-600 hover:text-red-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm"
          >
            {/* a11y: Icono decorativo silenciado */}
            <FaTimes aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200 break-words whitespace-pre-wrap font-mono">
            {errorMessage}
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button 
            variant="secondary" 
            onClick={onClose}
            // a11y: Auto focus por defecto en la acción segura
            autoFocus
          >
            {t('notificationsPage.boton_cerrar', 'Cerrar')}
          </Button>
        </div>

      </div>
    </div>
  );
};