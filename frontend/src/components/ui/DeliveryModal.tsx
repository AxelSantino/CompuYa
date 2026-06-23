import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { FaKey } from 'react-icons/fa';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

import { useFocusTrap } from '@/hooks/useFocusTrap';

interface DeliveryModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (code: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const [code, setCode] = useState('');

  // Referencia para atrapar el tab dentro del modal
  const modalRef = useRef<HTMLDivElement>(null);

  const {t} = useTranslation();

  // CUSTOM HOOK PARA ATRAPAR EL TAB
  useFocusTrap({ 
    isOpen, 
    onClose: onCancel, 
    modalRef, 
    isProcessing 
  });

  confirmText = t('routesPage.delivery_modal.confirmar_entrega');
  cancelText = t('routesPage.delivery_modal.cancelar');

  // Solo conservamos el useEffect encargado de limpiar el input visualmente
  useEffect(() => {
    if (isOpen) {
      setCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onConfirm(code.trim());
    }
  };

  return (
    // Backdrop con aria-hidden para que el lector no lo lea
    <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Contenedor del Modal con roles ARIA y ref para mantener el tab */}
      <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true" 
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 animate-in zoom-in-95 duration-200 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div aria-hidden="true" className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg">
            <FaKey />
          </div>
          <h3 id="modal-title" className="text-xl font-bold text-gray-950">{title}</h3>
        </div>

        <p id="modal-description" className="text-gray-600 text-sm mb-5 leading-relaxed">{message}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              {t('routesPage.delivery_modal.pin_de_seguridad')}
            </label>
            <input
              id="pin-input"
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Solo permite números
              className="w-full text-gray-900 text-center text-3xl font-bold tracking-[0.5em] pl-[0.5em] py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all uppercase placeholder-gray-400 bg-gray-50/50"
              placeholder="0000"
              disabled={isProcessing}
              autoFocus
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isProcessing || code.trim().length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {isProcessing ? t('routesPage.delivery_modal.procesando') : confirmText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
