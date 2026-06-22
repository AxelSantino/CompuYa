import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface CancelShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  isProcessing: boolean;
}

const REASON_KEYS = [
  'cliente_solicito',
  'direccion_invalida',
  'problemas_logisticos',
  'otro'
];

export const CancelShipmentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing 
}: CancelShipmentModalProps) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Limpiamos los campos cada vez que el modal se abre para evitar datos "fantasma"
  useEffect(() => {
    if (isOpen) {
      setSelectedOption('');
      setCustomReason('');
    }
  }, [isOpen]);

  // Trampa de foco para atrapar el Tab dentro del modal
  useFocusTrap({
    isOpen,
    onClose,
    modalRef
  });

  // Si el modal está cerrado, no renderizamos nada (ahorra recursos)
  if (!isOpen) return null;

  const charCount = customReason.length;
    
  const isCustomOption = selectedOption === 'otro';

  // Lógica de validación para habilitar/deshabilitar el botón de confirmar
    const isConfirmDisabled = 
        isProcessing || 
        !selectedOption || 
        (isCustomOption && (charCount === 0 || charCount > 255));

  const handleConfirm = () => {
    // Si eligió "Otro", mandamos el texto tipeado. Si no, mandamos la opción predefinida.
    const finalReason = isCustomOption ? customReason.trim() : t(`cancelShipment.razones.${selectedOption}`);
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Contenedor principal con Roles ARIA de diálogo */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        aria-describedby="cancel-modal-description"
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Cabecera del Modal */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-red-700">{t('cancelShipment.titulo')}</h3>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            aria-label={t('cancelShipment.cerrar_modal', 'Cerrar modal de cancelación')}
            className="text-red-500 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
          >
            <FaTimes aria-hidden="true" size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            {t('cancelShipment.descripcion')}
          </p>

          <fieldset className="space-y-3 mb-6">
            <legend className="sr-only">{t('cancelShipment.seleccione_motivo', 'Seleccione un motivo')}</legend>
            
            {REASON_KEYS.map((key) => (
              <label 
                key={key} 
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === key ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={key}
                  checked={selectedOption === key}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  disabled={isProcessing}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">{t(`cancelShipment.razones.${key}`)}</span>
              </label>
            ))}
          </fieldset>

        {/* Textarea Condicional para "Otro" */}
          {isCustomOption && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
              <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
                {t('cancelShipment.especifique_motivo')} <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                disabled={isProcessing}
                placeholder={t('cancelShipment.placeholder')}
                className={`w-full rounded-md border p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-shadow resize-none ${
                  charCount > 255 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-red-500'
                }`}
              />
              <div className="flex justify-end mt-1">
                <span
                  aria-live="polite" 
                  className={`text-xs font-medium ${charCount > 255 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                  {charCount}{t('cancelShipment.caracteres')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botonera de Acción */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isProcessing}
            autoFocus
          >
            {t('cancelShipment.btn_volver')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700 shadow-md"
          >
            {isProcessing ? t('cancelShipment.procesando') : t('cancelShipment.btn_confirmar')}
          </Button>
        </div>
      </div>
    </div>
  );
};