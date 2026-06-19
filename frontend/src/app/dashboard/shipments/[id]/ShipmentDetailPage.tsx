'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { FaArrowLeft, FaTimesCircle } from 'react-icons/fa';
import './ShipmentDetailPage.css';
import { useShipmentDetail } from './hooks/useShipmentDetail';
import { ShipmentHeader } from './components/ShipmentHeader';
import { RecipientInfoCard } from './components/RecipientInfoCard';
import { ShipmentInfoCard } from './components/ShipmentInfoCard';
import { AuditTimeline } from './components/AuditTimeline';
import { CancelShipmentModal } from './components/CancelShipmentModal';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

const DetailItem = React.memo(({ icon, label, value }: { icon?: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div>
    <h3 className="text-xs text-gray-500 flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
    </h3>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
));

DetailItem.displayName = 'DetailItem';

export default function ShipmentDetailPage() {
  
  const {t} = useTranslation();
  
  const {
    user, router, shipment, history, isLoading, isProcessing, error,
    isEditing, isSaving, formData, canEdit, handleCancel, handleEditClick,
    handleCancelEdit, handleChange, handleSubmit, isCancelModalOpen, closeCancelModal, confirmCancellation
  } = useShipmentDetail();

  const isBusy = isLoading || isProcessing || isSaving;
  const loadingText = isProcessing ? t('shipments.cancelando_envio') : isSaving ? t('shipments.guardando_cambios') : t('shipments.cargando_envio');

  return (
    <DashboardLayout>
      <div className="relative p-4 md:p-6">
        <LoadingOverlay isLoading={isBusy} text={loadingText} />
        
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => router.back()} className="back-button">
            <FaArrowLeft /> {t('shipments.volver_al_listado')}
          </button>
          
          {user?.rol === 'supervisor' && shipment && shipment.estado !== 'cancelado' && shipment.estado !== 'entregado' && (
            <button 
              onClick={handleCancel} 
              className="cancel-button"
              disabled={isProcessing}
            >
              <FaTimesCircle /> {t('shipments.cancelar_envio')}
            </button>
          )}
        </div>

        {shipment && (
          <>
            <ShipmentHeader shipment={shipment} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                
                <ShipmentInfoCard
                  shipment={shipment}
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  isSaving={isSaving}
                  canEdit={canEdit}
                  onEditClick={handleEditClick}
                />

                <RecipientInfoCard
                  shipment={shipment}
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  isSaving={isSaving}
                />

                {isEditing && (
                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" type="button" onClick={handleCancelEdit} disabled={isSaving}>{t('shipments.cancelar_edicion')}</Button>
                    <Button variant="primary" type="submit" disabled={isSaving}>{isSaving ? t('shipments.guardando') : t('shipments.guardar_todos_los_cambios')}</Button>
                  </div>
                )}
              </form>

              {user?.rol === 'supervisor' && history.length > 0 && (
                <div>
                  <AuditTimeline history={history} />
                </div>
              )}
            </div>
          </>
        )}

        {error && !isLoading && <div className="text-center py-10 text-red-500 font-medium">{error}</div>}

        <CancelShipmentModal 
          isOpen={isCancelModalOpen}
          onClose={closeCancelModal}
          onConfirm={confirmCancellation}
          isProcessing={isProcessing}
        />
      </div>
    </DashboardLayout>
  );
}