import React from 'react';
import { Input } from '@/components/ui/Input';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface ClientDetailsProps {
  formData: {
    razon_social: string;
    cuit: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

export const ClientDetailsSection = ({
  formData,
  handleChange,
  isLoading = false
}: ClientDetailsProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        {/* a11y: Silenciamos la barra decorativa */}
        <span aria-hidden="true" className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
        {t('newClientPage.datos_empresa')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {/* a11y: Vinculamos el label con el input mediante htmlFor */}
          <label htmlFor="razon_social" className="block text-sm font-medium text-gray-700 mb-1">
            {t('newClientPage.razon_social')} 
            {/* a11y: Silenciamos el asterisco y subimos contraste a red-600 */}
            <span aria-hidden="true" className="text-red-600 ml-1">*</span>
          </label>
          <Input
            id="razon_social"
            type="text"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            // i18n: Pasamos el placeholder por el traductor
            placeholder={t('newClientPage.placeholder_razon_social', 'Ej. Logística Sur S.A.')}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          {/* a11y: Vinculamos el label con el input mediante htmlFor */}
          <label htmlFor="cuit" className="block text-sm font-medium text-gray-700 mb-1">
            CUIT 
            {/* a11y: Silenciamos el asterisco y subimos contraste a red-600 */}
            <span aria-hidden="true" className="text-red-600 ml-1">*</span>
          </label>
          <Input
            id="cuit"
            type="text"
            name="cuit"
            value={formData.cuit}
            onChange={handleChange}
            // i18n: Pasamos el placeholder por el traductor
            placeholder={t('newClientPage.placeholder_cuit', 'Ej. 30-12345678-9')}
            required
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};