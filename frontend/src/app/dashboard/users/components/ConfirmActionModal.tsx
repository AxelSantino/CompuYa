import React from 'react';
import { Button } from '@/components/ui/Button';

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
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  onClose,
  onConfirm
}: ConfirmActionModalProps) => {
  
  if (!isOpen) return null;

  const titleColor = 
    variant === 'danger' ? 'text-red-600' : 
    variant === 'success' ? 'text-green-600' : 
    'text-blue-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 relative animate-in zoom-in-95 duration-200">
        
        <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${titleColor}`}>
          {icon && <span>{icon}</span>}
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6 text-sm">
          {message}
        </p>
        
        <div className="flex justify-end gap-3 mt-8">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              confirmText
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};