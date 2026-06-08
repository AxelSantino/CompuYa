import React from 'react';
import { Button } from '@/components/ui/Button';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface ErrorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

export const ErrorDetailModal = ({ isOpen, onClose, errorMessage }: ErrorDetailModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative zoom-in duration-200">
        
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600" />
            Detalle del Error
          </h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-700 transition-colors focus:outline-none">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200 break-words whitespace-pre-wrap font-mono">
            {errorMessage}
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>

      </div>
    </div>
  );
};