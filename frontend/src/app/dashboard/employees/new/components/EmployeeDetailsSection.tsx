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
  const { t } = useTranslation();
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        {/* a11y: Silenciamos la barra decorativa */}
        <span aria-hidden="true" className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
        {t('newEmployeesPage.datos_personales')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          {/* a11y: Vinculamos el label con el input mediante htmlFor */}
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            {t('newEmployeesPage.nombre')} 
            {/* a11y: Silenciamos el asterisco y mejoramos el contraste a red-600 */}
            <span aria-hidden="true" className="text-red-600 ml-1">*</span>
          </label>
          <Input
            id="nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            // i18n: Pasamos el placeholder por el traductor
            placeholder={t('newEmployeesPage.placeholder_nombre', 'Ej. Juan')}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          {/* a11y: Vinculamos el label con el input mediante htmlFor */}
          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
            {t('newEmployeesPage.apellido')} 
            {/* a11y: Silenciamos el asterisco y mejoramos el contraste a red-600 */}
            <span aria-hidden="true" className="text-red-600 ml-1">*</span>
          </label>
          <Input
            id="apellido"
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            // i18n: Pasamos el placeholder por el traductor
            placeholder={t('newEmployeesPage.placeholder_apellido', 'Ej. Pérez')}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 pr-0 md:pr-2">
        {/* a11y: Vinculamos el label con el select mediante htmlFor */}
        <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
          {t('newEmployeesPage.rol')} 
          {/* a11y: Silenciamos el asterisco y mejoramos el contraste a red-600 */}
          <span aria-hidden="true" className="text-red-600 ml-1">*</span>
        </label>
        <Select
          id="rol"
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