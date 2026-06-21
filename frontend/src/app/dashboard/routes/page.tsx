'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import withAuth from '@/components/auth/withAuth';
import './RoutesPage.css';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DeliveryModal } from '@/components/ui/DeliveryModal';

import { useRouteManagement } from '../routes/hooks/useRouteManagment';
import { RoutesHeader } from '../routes/components/RoutesHeader';
import { SupervisorPanel } from '../routes/components/SupervisorPanel';
import { DriverRoutePanel } from '../routes/components/DriverRoutePanel';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

function RoutesPage() {
  const {
    user,
    isSupervisor,
    shipments,
    route,
    repartidores,
    selectedDriverId,
    setSelectedDriverId,
    isLoading,
    isProcessing,
    mapPoints,
    handleManualAssign,
    handleAssignAll,
    handleDeliver,
    handleConfirmDelivery,
    modalConfig,
    closeModal,
    deliveryModalConfig,
    closeDeliveryModal
  } = useRouteManagement();

  const {t} = useTranslation();

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-4 md:p-6">
        <LoadingOverlay isLoading={isLoading || isProcessing} text={t('routesPage.actualizando_logistica')} />
        
        <RoutesHeader 
          showAssignButton={isSupervisor}
          pendingCount={shipments.length}
          isProcessing={isProcessing}
          onAssignAll={handleAssignAll}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {isSupervisor && (
            <SupervisorPanel 
              repartidores={repartidores}
              selectedDriverId={selectedDriverId}
              onSelectDriver={setSelectedDriverId}
              shipments={shipments}
              onManualAssign={handleManualAssign}
            />
          )}

          <div className={isSupervisor ? "xl:col-span-2" : "xl:col-span-3"}>
            <DriverRoutePanel 
              route={route}
              mapPoints={mapPoints}
              isSupervisor={isSupervisor}
              selectedDriverId={selectedDriverId}
              userRole={user?.rol}
              isProcessing={isProcessing}
              onDeliver={handleDeliver}
            />
          </div>

        </div>

        <ConfirmModal 
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onCancel={closeModal}
        />

        <DeliveryModal
          isOpen={deliveryModalConfig.isOpen}
          title={t('routesPage.confirmar_entrega', 'Confirmar entrega')}
          message={t('routesPage.confirmar_entrega_mensaje', { id: deliveryModalConfig.trackingId })}
          onConfirm={handleConfirmDelivery}
          onCancel={closeDeliveryModal}
          isProcessing={isProcessing}
        />
      </div>
    </DashboardLayout>
  );
}

export default withAuth(RoutesPage, ['supervisor', 'repartidor']);