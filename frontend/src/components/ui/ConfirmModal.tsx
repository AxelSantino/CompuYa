'use client';

import React, { useRef } from 'react';
import { Button } from './Button';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    isOpen,
    onClose: onCancel,
    modalRef
  });

  if (!isOpen) return null;

  const finalConfirmText = confirmText || t('routesPage.delivery_modal.confirmar', 'Confirmar');
  const finalCancelText = cancelText || t('routesPage.delivery_modal.cancelar', 'Cancelar');

  return (
    // Backdrop (Fondo oscuro) oculto para lectores ARIA
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Contenedor del Modal */}
      <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 animate-in zoom-in-95 duration-200"
      >
        <h3 id="confirm-modal-title" className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p id="confirm-modal-description" className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          {/* autofocus para que la opcion predeterminada sea cancelar y el tab quede encerrado en el modal*/}
          <Button variant="secondary" onClick={onCancel} autoFocus>
            {finalCancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {finalConfirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};