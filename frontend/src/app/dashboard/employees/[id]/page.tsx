'use client';

import React, { use } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FaArrowLeft, FaUserTie, FaEnvelope, FaIdBadge, FaCalendarAlt } from 'react-icons/fa';
import { useEmployeeProfile } from './hooks/useEmployeeProfile'
import { getRoleBadgeClasses } from '../components/employeeColumns';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100">
    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
      <span className="text-gray-400">{icon}</span> {label}
    </h4>
    <p className="text-sm font-medium text-gray-900 ml-6">{value}</p>
  </div>
);

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const {
    router, employee, isLoading, error, isEditing, setIsEditing,
    isSaving, formData, handleChange, handleCancelEdit, handleSave
  } = useEmployeeProfile(resolvedParams.id);

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-red-500 font-medium">
          {error}
          <div className="mt-4">
            <Button variant="secondary" onClick={() => router.push('/dashboard/employees')}>Volver al listado</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const iniciales = employee ? `${employee.perfil_empleado?.nombre?.charAt(0) || ''}${employee.perfil_empleado?.apellido?.charAt(0) || ''}`.toUpperCase() : '👤';

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 relative min-h-screen">
        <LoadingOverlay isLoading={isLoading} text="Cargando perfil del empleado..." />

        <div className="mb-6">
          <button 
            onClick={() => router.push('/dashboard/employees')} 
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft /> Volver a la nómina
          </button>
        </div>

        {employee && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              
              <div className="p-6 md:p-10">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-2xl font-bold text-gray-500 shadow-sm shrink-0">
                      {iniciales}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 capitalize">
                        {employee.perfil_empleado?.nombre} {employee.perfil_empleado?.apellido}
                      </h1>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                        <Input name="nombre" required value={formData.nombre} onChange={handleChange} disabled={isSaving} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Apellido</label>
                        <Input name="apellido" required value={formData.apellido} onChange={handleChange} disabled={isSaving} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                        <Input name="email" type="email" value={employee.email} disabled={true} className="bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" />
                        <p className="text-xs text-gray-400 mt-1">Por seguridad, el correo no se puede modificar.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Rol en el Sistema</label>
                        <Select name="rol" value={formData.rol} onChange={handleChange} disabled={isSaving}>
                          <option value="operador">Operador</option>
                          <option value="repartidor">Repartidor</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="admin">Administrador</option>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="secondary" type="button" onClick={handleCancelEdit} disabled={isSaving}>Cancelar</Button>
                      <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <DetailItem icon={<FaUserTie />} label="Nombre Completo" value={`${employee.perfil_empleado?.nombre} ${employee.perfil_empleado?.apellido}`.trim()} />
                    <DetailItem icon={<FaIdBadge />} label="Rol Asignado" 
                    value={<span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize  ${getRoleBadgeClasses(employee.rol)}`}>
                        {employee.rol}</span>} />
                    <DetailItem icon={<FaEnvelope />} label="Correo de Acceso" value={employee.email} />
                    <DetailItem icon={<FaCalendarAlt />} label="Fecha de Registro" value={new Date(employee.fecha || '').toLocaleDateString('es-AR')} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}