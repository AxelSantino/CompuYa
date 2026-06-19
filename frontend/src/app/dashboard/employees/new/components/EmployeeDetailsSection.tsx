import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface EmployeeDetailsProps {
  formData: {
    nombre: string;
    apellido: string;
    rol: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isLoading?: boolean;
}

export const EmployeeDetailsSection = ({
  formData,
  handleChange,
  isLoading = false
}: EmployeeDetailsProps) => {
  const{t}=useTranslation();
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
        {t('newEmployeesPage.datos_personales')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('newEmployeesPage.nombre')} <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej. Juan"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('newEmployeesPage.apellido')} <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ej. Pérez"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 pr-0 md:pr-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('newEmployeesPage.rol')} <span className="text-red-500">*</span>
        </label>
        <Select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          required
          disabled={isLoading}
        >
          <option value="" disabled>{t('newEmployeesPage.selecciona_rol')}</option>
          {/* Usamos 'admin' para coincidir con la validación de seguridad*/}
          <option value="admin">{t('newEmployeesPage.rol_admin')}</option>
          <option value="supervisor">{t('newEmployeesPage.rol_supervisor')}</option>
          <option value="operador">{t('newEmployeesPage.rol_operador')}</option>
          <option value="repartidor">{t('newEmployeesPage.rol_repartidor')}</option>
        </Select>
      </div>
    </div>
  );
};