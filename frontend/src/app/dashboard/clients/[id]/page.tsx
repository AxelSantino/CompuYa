'use client';

import React, { use } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useClientProfile } from './hooks/useClientProfile';
import { LocationManager } from '../new/components/LocationManager';
import withAuth from '@/components/auth/withAuth';
import { 
  FaArrowLeft, 
  FaBuilding, 
  FaIdCard, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaHashtag, 
  FaUserSlash, 
  FaUserCheck
} from 'react-icons/fa';
import { ConfirmActionModal } from '@/app/dashboard/users/components/ConfirmActionModal';
import { useTranslation } from 'react-i18next';
// Deshabilitamos SSR para el visor de mapas en modo lectura para evitar errores con Leaflet
const DynamicMapViewer = dynamic(() => import('../new/components/MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
      <span className="text-gray-400 font-medium animate-pulse">Cargando mapa de ubicación...</span>
    </div>
  )
});

// Componente Interno para mostrar los datos de lectura prolijamente
const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100">
    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
      <span className="text-gray-400">{icon}</span> {label}
    </h4>
    <p className="text-sm font-medium text-gray-900 ml-6 break-words">{value}</p>
  </div>
);

function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const {t} = useTranslation();
  const {
    router,
    client,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    isSaving,
    formData,
    handleChange,
    handleCancelEdit,
    handleSave,
    handleAddressUpdated,

    // variables para desactivar usuario con el modal
    isChangingStatus, 
    isStatusModalOpen, 
    pendingStatus, 
    handleRequestStatusChange, 
    handleCloseStatusModal, 
    handleConfirmStatusChange
  } = useClientProfile(resolvedParams.id);

  // CAMBIAR CUANDO LA API DEVUELVA EL ESTADO DEL EMPLEADO
  const isClientActive = client?.activo ?? true;

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-red-500 font-medium">
          {error}
          <div className="mt-4">
            <Button variant="secondary" onClick={() => router.push('/dashboard/clients')}>
              {t('clientDetail.volver')}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Iniciales para la empresa (Razón Social)
  const iniciales = client?.perfil_empresa?.razon_social
    ? client.perfil_empresa.razon_social.substring(0, 2).toUpperCase()
    : '🏢';

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 relative min-h-screen">
        <LoadingOverlay isLoading={isLoading} text="Cargando ficha del cliente..." />

        {/* Botón de navegación superior */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/dashboard/clients')} 
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <FaArrowLeft /> {t('clientDetail.volver')}
          </button>
        </div>

        {client && (
          <div className="max-w-5xl mx-auto">
            {/* Tarjeta de Contenedor Principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 md:p-10">
                
                {/* Cabecera de la Ficha */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-2xl font-bold text-gray-500 shadow-sm shrink-0">
                      {iniciales}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 capitalize">
                        {client.perfil_empresa?.razon_social}
                      </h1>
                      <p className="text-gray-500 font-medium mt-1">CUIT: {client.perfil_empresa?.cuit || 'No registrado'}</p>
                      <span className={`text-sm font-medium ${isClientActive ? 'text-green-600' : 'text-red-600'}`}>
                        {isClientActive ? t('clientDetail.cuenta_activa') : t('clientDetail.cuenta_inactiva')}
                      </span>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <div className="flex gap-3">
                      <Button 
                        variant={isClientActive ? 'danger' : 'success'}
                        onClick={() => handleRequestStatusChange(!isClientActive)}
                        className="flex items-center gap-2"
                      >
                        {isClientActive ? <FaUserSlash /> : <FaUserCheck />}
                        {isClientActive ? t('clientDetail.btn_desactivar') : t('clientDetail.btn_editar')}
                      </Button>   
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                      {t('clientDetail.btn_editar')}
                    </Button>
                    </div>
                  )}
                </div>

                {/* Contenido Dinámico: Formulario vs Vista General */}
                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">{t('clientDetail.datos_empresa')}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t('clientDetail.form.razon_social')}</label>
                          <Input name="razon_social" required value={formData.razon_social} onChange={handleChange} disabled={isSaving} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t('clientDetail.form.email')}</label>
                          <Input name="email" type="email" value={client.email} disabled={true} className="bg-gray-100 text-gray-500 cursor-not-allowed opacity-70" />
                          <p className="text-xs text-gray-400 mt-1">{t('clientDetail.form.email_bloqueado')}</p>
                        </div>
                      </div>
                    </div>

                    <LocationManager 
                      codPostal={formData.cod_postal}
                      onCodPostalChange={handleChange}
                      initialAddress={formData.direccion_normalizada}
                      initialLat={formData.latitud}
                      initialLng={formData.longitud}
                      onLocationComplete={(direccion) => {
                      }}
                      isLoading={isSaving}
                    />
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <Button variant="secondary" type="button" onClick={handleCancelEdit} disabled={isSaving}>
                        {t('clientDetail.form.btn_cancelar')}
                      </Button>
                      <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? t('clientDetail.form.guardando') : t('clientDetail.form.btn_guardar')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <DetailItem icon={<FaBuilding />} label={t('clientDetail.details.razon_social')} value={client.perfil_empresa?.razon_social} />
                      <DetailItem icon={<FaHashtag />} label={t('clientDetail.details.cuit')} value={client.perfil_empresa?.cuit} />
                      <DetailItem icon={<FaEnvelope />} label={t('clientDetail.details.email')} value={client.email} />
                      <DetailItem icon={<FaCalendarAlt />} label={t('clientDetail.details.fecha_alta')} value={new Date(client.fecha || '').toLocaleDateString('es-AR')} />
                      <DetailItem icon={<FaIdCard />} label={t('clientDetail.details.cod_postal')} value={client.perfil_empresa?.cod_postal || t('clientDetail.details.no_asignado')} />
                      <DetailItem icon={<FaMapMarkerAlt />} label={t('clientDetail.details.direccion')} value={client.perfil_empresa?.direccion_normalizada || t('clientDetail.details.no_especificada')} />
                    </div>

                    <div className="flex flex-col pt-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-green-500" /> {t('clientDetail.mapa.titulo')}
                      </h4>
                      
                      {client.perfil_empresa?.latitud && client.perfil_empresa?.longitud ? (
                        <div className="w-full h-[450px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <DynamicMapViewer 
                            latitud={client.perfil_empresa.latitud}
                            longitud={client.perfil_empresa.longitud}
                            direccionNormalizada={client.perfil_empresa.direccion_normalizada ?? undefined}
                          />
                        </div>
                      ) : (
                        /* Si no hay mapa, se achicael alto del mensaje vacío para que no ocupe tanto espacio */
                        <div className="w-full h-[200px] bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-4 text-center text-sm transition-all">
                          <FaMapMarkerAlt className="text-gray-300 text-3xl mb-2" />
                          <p>{t('clientDetail.mapa.no_coordenadas')}</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <ConfirmActionModal
          isOpen={isStatusModalOpen}
          isLoading={isChangingStatus}
          variant={pendingStatus ? 'success' : 'danger'}
          icon={pendingStatus ? <FaUserCheck /> : <FaUserSlash />}
          title={pendingStatus ? t('clientDetail.modal.activar_title') : t('clientDetail.modal.desactivar_title')}
          message={
          pendingStatus
            ? t('clientDetail.modal.activar_msg')
            : t('clientDetail.modal.desactivar_msg')
          }
          confirmText={pendingStatus ? t('clientDetail.modal.confirm_activar') : t('clientDetail.modal.confirm_desactivar')}
          cancelText={t('clientDetail.modal.cancelar')}
         onClose={handleCloseStatusModal}
         onConfirm={handleConfirmStatusChange}
        />
      </div>
    </DashboardLayout>
  );
}

export default withAuth(ClientDetailPage, ['admin']);