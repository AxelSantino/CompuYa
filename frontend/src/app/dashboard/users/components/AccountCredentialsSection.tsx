import React from 'react';
import { Input } from '@/components/ui/Input';

interface AccountCredentialsProps {
  formData: {
    email: string;
    password?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

export const AccountCredentialsSection = ({ 
  formData, 
  handleChange, 
  isLoading = false 
}: AccountCredentialsProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
        Credenciales de Acceso
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="usuario@ejemplo.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <Input
            type="password"
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
          {//<p className="text-xs text-gray-500 mt-1">
           // Mínimo 8 caracteres.
          //</p>
          }
        </div>
      </div>
    </div>
  );
};