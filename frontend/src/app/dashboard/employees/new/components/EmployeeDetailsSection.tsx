import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
        Datos Personales y Rol
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
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
            Apellido <span className="text-red-500">*</span>
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
          Rol del Empleado <span className="text-red-500">*</span>
        </label>
        <Select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          required
          disabled={isLoading}
        >
          <option value="" disabled>Seleccione un rol...</option>
          {/* Usamos 'admin' para coincidir con la validación de seguridad*/}
          <option value="admin">Administrador</option>
          <option value="supervisor">Supervisor</option>
          <option value="operador">Operador</option>
          <option value="repartidor">Repartidor</option>
        </Select>
      </div>
    </div>
  );
};