'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import withAuth from '@/components/auth/withAuth';
import { useRouter } from 'next/navigation';
import { useShipmentForm } from '@/app/dashboard/new/hooks/useShipmentForm';
import { RecipientSection } from './components/RecipientSection';
import { ComponentDetailsSection } from './components/ComponentDetailsSection';
import { SuccessFeedback } from '@/components/ui/SuccessFeedback';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';



const NewShipmentPage = () => {
  const {t} = useTranslation();
  const router = useRouter();
    
  // El hook personalizado maneja toda la lógica del formulario, incluyendo estado, cambios y envío
  const { formData, handleChange, handleSubmit, isLoading, error, handleRazonSocialBlur, isSearchingRecipient, recipientNotFound, createdTrackingId } = useShipmentForm();

  if (createdTrackingId) {
    return (
      <DashboardLayout>
        <SuccessFeedback 
          title="¡Envío Creado Exitosamente!"
          message={
            <span>
              El envío ha sido registrado en el sistema y se le asignó el siguiente tracking ID:<br/><br/>
              <strong className="text-xl text-blue-700 tracking-wide bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                {createdTrackingId}
              </strong>
            </span>
          }
          buttonText="Volver a la Gestión de Envíos"
          onButtonClick={() => router.push('/dashboard')}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 group"
        >
          <span className="mr-1 group-hover:-translate-x-1 transition-transform inline-block">←</span> {t('newShipmentPage.volver')}
        </button>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{t('newShipmentPage.registrar_nuevo_envio')}</h2>
        <p className="text-gray-600 mb-8">
          {t('newShipmentPage.completa_los_datos')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RecipientSection 
            formData={formData} 
            handleChange={handleChange} 
            handleRazonSocialBlur={handleRazonSocialBlur}
            isSearchingRecipient={isSearchingRecipient}
            isLoading={isLoading}
            recipientNotFound={recipientNotFound}
            />
          <ComponentDetailsSection 
            formData={formData} 
            handleChange={handleChange} 
            isLoading={isLoading} />
          
          {error ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm animate-pulse">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => router.push('/dashboard')} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {t('newShipmentPage.boton_cancelar')}
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto shadow-md"
            >
              {isLoading ? t('newShipmentPage.registrando') : t('newShipmentPage.generar_trackingID_registrar')}
            </Button>
          </div>
          <p className="text-xs text-center text-gray-400 pb-8">{t('newShipmentPage.campos_obligatorios')}</p>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default withAuth(NewShipmentPage);
