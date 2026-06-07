'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/services/userService';
import { Usuario } from '@/types/usuario';
import LoadingOverlay from '@/components/LoadingOverlay';
import { LocationManager } from '../../new/components/LocationManager';
import { DireccionNormalizada } from '@/services/usigService';

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [client, setClient] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({ 
    razon_social: '', 
    cuit: '',
    latitud: 0,
    longitud: 0,
    direccion_normalizada: '',
    provincia: '',
    municipio: '',
    cod_postal: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const allUsers = await userService.getUsers();
        const found = allUsers.find(u => u.id === parseInt(id));
        if (found) {
            setClient(found);
            setFormData({
                razon_social: found.perfil_empresa?.razon_social || '',
                cuit: found.perfil_empresa?.cuit || '',
                latitud: found.perfil_empresa?.latitud || 0,
                longitud: found.perfil_empresa?.longitud || 0,
                direccion_normalizada: found.perfil_empresa?.direccion_normalizada || '',
                provincia: found.perfil_empresa?.provincia || '',
                municipio: found.perfil_empresa?.municipio || '',
                cod_postal: found.perfil_empresa?.cod_postal || ''
            });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleLocationComplete = (direccion: DireccionNormalizada) => {
    if (!direccion.coordenadas) return;

    setFormData(prev => ({
        ...prev,
        latitud: parseFloat(direccion.coordenadas!.y),
        longitud: parseFloat(direccion.coordenadas!.x),
        direccion_normalizada: direccion.direccion,
        provincia: direccion.nombre_partido || '',
        municipio: direccion.nombre_localidad || ''
    }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
        await userService.updateEmployee(parseInt(id), formData);
        setIsEditing(false);
        const allUsers = await userService.getUsers();
        const found = allUsers.find(u => u.id === parseInt(id));
        if (found) setClient(found);
    } catch (err) {
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (confirm('¿Estás seguro de que deseas desactivar a este cliente?')) {
        try {
            await userService.deactivateEmployee(parseInt(id));
            router.push('/dashboard/clients');
        } catch (err) {
            console.error(err);
        }
    }
  };

  if (!user || user.rol !== 'admin') return <DashboardLayout>Acceso denegado</DashboardLayout>;
  if (isLoading || !client) return <DashboardLayout><LoadingOverlay isLoading={true} text="Cargando..." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalle del Cliente</h2>
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
                    <label className="block text-sm font-medium text-gray-500">Razón Social</label>
                    {isEditing ? <Input value={formData.razon_social} onChange={(e) => setFormData({...formData, razon_social: e.target.value})} /> : <p className="text-lg">{client.perfil_empresa?.razon_social}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">CUIT</label>
                    {isEditing ? <Input value={formData.cuit} onChange={(e) => setFormData({...formData, cuit: e.target.value})} /> : <p className="text-lg">{client.perfil_empresa?.cuit}</p>}
                </div>
            </div>
            
            {isEditing && (
                <LocationManager 
                    onLocationComplete={handleLocationComplete}
                    codPostal={formData.cod_postal}
                    onCodPostalChange={(e) => setFormData({...formData, cod_postal: e.target.value})}
                />
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{client.email}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
