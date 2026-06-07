'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/services/userService';
import { Usuario } from '@/types/usuario';
import LoadingOverlay from '@/components/LoadingOverlay';

export function generateStaticParams() {
    return [];
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [employee, setEmployee] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', rol: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const allUsers = await userService.getUsers();
        const found = allUsers.find(u => u.id === parseInt(id));
        if (found) {
            setEmployee(found);
            setFormData({
                nombre: found.perfil_empleado?.nombre || '',
                apellido: found.perfil_empleado?.apellido || '',
                rol: found.rol
            });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
        await userService.updateEmployee(parseInt(id), formData);
        setIsEditing(false);
        // Refresh data
        const allUsers = await userService.getUsers();
        const found = allUsers.find(u => u.id === parseInt(id));
        if (found) setEmployee(found);
    } catch (err) {
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (confirm('¿Estás seguro de que deseas desactivar a este empleado?')) {
        try {
            await userService.deactivateEmployee(parseInt(id));
            router.push('/dashboard/employees');
        } catch (err) {
            console.error(err);
        }
    }
  };

  if (!user || user.rol !== 'admin') return <DashboardLayout>Acceso denegado</DashboardLayout>;
  if (isLoading || !employee) return <DashboardLayout><LoadingOverlay isLoading={true} text="Cargando..." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalle del Empleado</h2>
            <div className="flex gap-2">
                {!isEditing ? (
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>Editar</Button>
                ) : (
                    <Button variant="primary" onClick={handleUpdate} disabled={isSaving}>Guardar</Button>
                )}
                <Button variant="danger" onClick={handleDeactivate} className="bg-red-600 text-white hover:bg-red-700">Desactivar</Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre</label>
                    {isEditing ? <Input value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} /> : <p className="text-lg">{employee.perfil_empleado?.nombre}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Apellido</label>
                    {isEditing ? <Input value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} /> : <p className="text-lg">{employee.perfil_empleado?.apellido}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500">Rol</label>
                {isEditing ? (
                    <Select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                        <option value="admin">Administrador</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="operador">Operador</option>
                        <option value="repartidor">Repartidor</option>
                    </Select>
                ) : <p className="text-lg capitalize">{employee.rol}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{employee.email}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
