'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { useAuth } from '@/contexts/AuthContext';
import { SuccessFeedback } from '@/components/ui/SuccessFeedback';

// Importamos nuestro Hook y las 3 secciones visuales
import { useClientForm } from './hooks/useClientForm';
import { AccountCredentialsSection } from '../../users/components/AccountCredentialsSection';
import { ClientDetailsSection } from './components/ClientDetailsSection';
import { LocationManager } from './components/LocationManager';

export default function NewClientPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { 
    formData, 
    handleChange, 
    handleLocationComplete,
    handleSubmit, 
    isLoading, 
    error,
    createdClient
  } = useClientForm();

  // Control de seguridad (Solo Admin puede registrar empresas/clientes)
  if (!user || user.rol !== 'admin') {
    return (
      <DashboardLayout>
        <AccessDenied mensaje="No tienes permisos para dar de alta nuevos clientes/destinatarios." />
      </DashboardLayout>
    );
  }

  // Confirmacion de cliente creado
  if (createdClient) {
    return (
      <DashboardLayout>
        <SuccessFeedback 
          title="¡Registro Exitoso!"
          message={
            <p>
              La empresa <span className="font-bold text-gray-900">{formData.razon_social}</span> ha sido registrada con éxito y se le asignó el ID <span className="font-bold text-orange-600">#{createdClient.id}</span>.
            </p>
          }
          buttonText="Volver a la nómina de Clientes"
          onButtonClick={() => router.push('/dashboard/clients')}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        
        {/* Navegación y Encabezado */}
        <button 
          type="button"
          onClick={() => router.back()} 
          className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 group"
        >
          <span className="mr-1 group-hover:-translate-x-1 transition-transform inline-block">←</span> 
          Volver a la nómina
        </button>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Registrar Nuevo Cliente
        </h2>
        <p className="text-gray-600 mb-8">
          Crea una nueva cuenta corporativa y establece su ubicación fiscal para las operaciones logísticas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <AccountCredentialsSection 
            formData={formData} 
            handleChange={handleChange} 
            isLoading={isLoading} 
          />
          
          <ClientDetailsSection 
            formData={formData} 
            handleChange={handleChange} 
            isLoading={isLoading} 
          />

          <LocationManager 
            onLocationComplete={handleLocationComplete}
            codPostal={formData.cod_postal}
            onCodPostalChange={handleChange}
            isLoading={isLoading}
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm animate-pulse">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => router.push('/dashboard/clients')} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto shadow-md"
            >
              {isLoading ? 'Registrando...' : 'Registrar Cliente'}
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-400 pb-8 mt-4">
            Los campos con (*) son obligatorios.
          </p>
          
        </form>
      </div>
    </DashboardLayout>
  );
}