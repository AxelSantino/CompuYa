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
  const {t} = useTranslation();
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
        {t('newClientPage.datos_empresa')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('newClientPage.razon_social')} <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            placeholder="Ej. Logística Sur S.A."
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CUIT <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="cuit"
            value={formData.cuit}
            onChange={handleChange}
            placeholder="Ej. 30-12345678-9"
            required
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};