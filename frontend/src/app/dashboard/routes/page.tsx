'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import withAuth from '@/components/auth/withAuth';
import './RoutesPage.css';

import { useRouteManagement } from '../routes/hooks/useRouteManagment';
import { RoutesHeader } from '../routes/components/RoutesHeader';
import { SupervisorPanel } from '../routes/components/SupervisorPanel';
import { DriverRoutePanel } from '../routes/components/DriverRoutePanel';

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
    handleDeliver
  } = useRouteManagement();

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-4 md:p-6">
        <LoadingOverlay isLoading={isLoading || isProcessing} text="Actualizando logística..." />
        
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
      </div>
    </DashboardLayout>
  );
}

export default withAuth(RoutesPage, ['supervisor', 'repartidor']);