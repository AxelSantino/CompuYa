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
  const { t } = useTranslation();
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        {/* a11y: Silenciamos la barra decorativa */}
        <span aria-hidden="true" className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
        {t('newClientPage.credenciales_acceso')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {/* a11y: Vinculamos el label con el input mediante htmlFor */}
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('newClientPage.correo')} 
            {/* a11y: Silenciamos el asterisco y mejoramos el contraste a red-600 */}
            <span aria-hidden="true" className="text-red-600 ml-1">*</span>
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            // i18n: Pasamos el placeholder por el traductor
            placeholder={t('newClientPage.placeholder_email', 'usuario@ejemplo.com')}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          {/* a11y: Vinculamos el label con el input mediante htmlFor */}
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('newClientPage.contraseña')} 
            {/* a11y: Silenciamos el asterisco y mejoramos el contraste a red-600 */}
            <span aria-hidden="true" className="text-red-600 ml-1">*</span>
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
            // i18n: Pasamos el placeholder por el traductor
            placeholder={t('newClientPage.placeholder_password', '••••••••')}
            required
            disabled={isLoading}
          />
          {/* Mantenemos tu código comentado intacto */}
          {//<p className="text-xs text-gray-500 mt-1">
           // Mínimo 8 caracteres.
          //</p>
          }
        </div>
      </div>
    </div>
  );
};