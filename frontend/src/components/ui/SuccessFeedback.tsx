import React from 'react';
import { Button } from './Button';

interface SuccessFeedbackProps {
  title?: string;
  message: React.ReactNode;
  buttonText?: string;
  onButtonClick: () => void;
}

export const SuccessFeedback = ({ 
  title = "¡Operación Exitosa!", 
  message, 
  buttonText = "Volver", 
  onButtonClick 
}: SuccessFeedbackProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        
        <div className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </div>
        
        <Button 
          variant="primary" 
          onClick={onButtonClick}
          className="w-full"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};