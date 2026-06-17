import React from 'react';
import { Input } from '@/components/ui/Input';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

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
  const {t} = useTranslation();
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
        {t('newClientPage.credenciales_acceso')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('newClientPage.correo')} <span className="text-red-500">*</span>
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
            {t('newClientPage.contraseña')} <span className="text-red-500">*</span>
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