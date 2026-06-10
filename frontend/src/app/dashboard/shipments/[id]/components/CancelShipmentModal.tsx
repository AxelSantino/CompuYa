import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FaTimes } from 'react-icons/fa';

interface CancelShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  isProcessing: boolean;
}

const PREDEFINED_REASONS = [
  'El cliente solicitó la cancelación',
  'Dirección de entrega inválida',
  'Problemas logísticos con el paquete',
  'Otro/Ingresar motivo'
];

export const CancelShipmentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing 
}: CancelShipmentModalProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  // Limpiamos los campos cada vez que el modal se abre para evitar datos "fantasma"
  useEffect(() => {
    if (isOpen) {
      setSelectedOption('');
      setCustomReason('');
    }
  }, [isOpen]);

  // Si el modal está cerrado, no renderizamos nada (ahorra recursos)
  if (!isOpen) return null;

  const charCount = customReason.length;
    
  const isCustomOption = selectedOption === 'Otro/Ingresar motivo';

  // Lógica de validación para habilitar/deshabilitar el botón de confirmar
    const isConfirmDisabled = 
        isProcessing || 
        !selectedOption || 
        (isCustomOption && (charCount === 0 || charCount > 255));

  const handleConfirm = () => {
    // Si eligió "Otro", mandamos el texto tipeado. Si no, mandamos la opción predefinida.
    const finalReason = isCustomOption ? customReason.trim() : selectedOption;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Cabecera del Modal */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-red-700">Cancelar Envío</h3>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="text-red-400 hover:text-red-700 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Por favor, seleccione el motivo por el cual está cancelando este envío. Esta acción no se puede deshacer y quedará registrada en el historial.
          </p>

          <div className="space-y-3 mb-6">
            {PREDEFINED_REASONS.map((reason) => (
              <label 
                key={reason} 
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === reason ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedOption === reason}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  disabled={isProcessing}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">{reason}</span>
              </label>
            ))}
          </div>

        {/* Textarea Condicional para "Otro" */}
          {isCustomOption && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especifique el motivo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                disabled={isProcessing}
                placeholder="Describa brevemente la situación..."
                className={`w-full rounded-md border p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-shadow resize-none ${
                  charCount > 255 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-red-500'
                }`}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-medium ${charCount > 255 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                  {charCount}/255 caracteres
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
          >
            Volver
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700 shadow-md"
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Cancelación'}
          </Button>
        </div>
      </div>
    </div>
  );
};