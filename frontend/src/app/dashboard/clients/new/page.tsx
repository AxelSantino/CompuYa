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
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import withAuth from '@/components/auth/withAuth';


function NewClientPage() {
  const {t} = useTranslation();
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
        <AccessDenied mensaje={t('newClientPage.no_tienes_permisos')} />
      </DashboardLayout>
    );
  }

  // Confirmacion de cliente creado
  if (createdClient) {
    return (
      <DashboardLayout>
        <SuccessFeedback 
          title={t('newClientPage.registro_exitoso')}
          message={
            <p>
              {t('newClientPage.la_empresa')} <span className="font-bold text-gray-900">{formData.razon_social}</span> {t('newClientPage.ha_sido_registrada')} <span className="font-bold text-orange-600">#{createdClient.id}</span>.
            </p>
          }
          buttonText={t('newClientPage.volver_a_nomina_clientes')}
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
          {t('newClientPage.volver_nomina')}
        </button>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          {t('newClientPage.registrar_nuevo_cliente')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('newClientPage.nueva_cuenta_corporativa')}
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
              {t('newClientPage.boton_cancelar')}
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto shadow-md"
            >
              {isLoading ? t('newClientPage.registrando') : t('newClientPage.registrar_cliente')}
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-400 pb-8 mt-4">
            {t('newClientPage.campos_obligatorios')}
          </p>
          
        </form>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(NewClientPage, ['admin']);