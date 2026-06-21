import React from 'react';
import dynamic from 'next/dynamic';
import { FaTruck, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Envio } from '@/types/envio';
import { Button } from '@/components/ui/Button';

const MapHojaRuta = dynamic(() => import('@/components/MapHojaRuta'), { 
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Cargando mapa de ruta...</div>
});

const PRIORITY_TAG_CLASSES: Record<string, string> = {
  'alta': 'bg-orange-100 text-orange-700 border-orange-200',
  'media': 'bg-blue-100 text-blue-700 border-blue-200',
  'baja': 'bg-green-100 text-green-700 border-green-200',
};

interface DriverRoutePanelProps {
  route: Envio[];
  mapPoints: any[];
  isSupervisor: boolean;
  selectedDriverId: number | null;
  userRole?: string;
  isProcessing: boolean;
  onDeliver: (trackingId: string) => void;
}

export const DriverRoutePanel: React.FC<DriverRoutePanelProps> = ({
  route, mapPoints, isSupervisor, selectedDriverId, userRole, isProcessing, onDeliver
}) => {
  const { t } = useTranslation();

  if (route.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200 p-20 text-center text-gray-400">
        <FaRoute className="text-6xl mx-auto mb-4 opacity-75" />
        <h3 className="text-xl font-medium text-gray-500">
          {selectedDriverId ? t('routesPage.este_repartidor_no_tiene_entregas') : t('routesPage.sin_recorrido_asignado')}
        </h3>
        <p className="mt-2 text-sm">
          {isSupervisor && !selectedDriverId ? t('routesPage.selecciona_un_repartidor') : t('routesPage.entregas_apareceran_aqui')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CARD MAPA */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 flex items-center justify-between bg-green-50 text-green-800 border-b border-green-100 font-bold text-lg">
          <h2 className="flex items-center gap-2">
            <FaTruck /> {selectedDriverId ? t('routesPage.visualizando_recorrido_del_repartidor') : t('routesPage.mi_hoja_de_ruta_optimizada')}
          </h2>
          <span className="text-xs font-medium">{t('routesPage.orden_eficiente_sugerido')}</span>
        </div>
        <div className="p-0">
          <MapHojaRuta puntos={mapPoints} />
        </div>
      </div>

      {/* CARD LISTA DE ENTREGAS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-100 font-bold text-lg text-gray-700">
          <h2>{t('routesPage.orden_de_entrega')}</h2>
        </div>
        <div className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-gray-100">
            {route.map((e, index) => (
              <div key={e.id} className="p-4 flex items-start justify-between gap-4 group hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 text-sm">{e.tracking_id}</p>
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border font-bold ${PRIORITY_TAG_CLASSES[e.prioridad] || 'bg-gray-100 text-gray-600'}`}>
                        {t(`routesPage.prioridades.${e.prioridad}`)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaMapMarkerAlt /> {e.destinatario.perfil_empresa?.razon_social}
                    </p>
                  </div>
                </div>
                
                {/* Reemplazo de .btn-deliver */}
                {(!selectedDriverId && (userRole === 'repartidor' || userRole === 'operador')) && (
                  <Button 
                    variant="success"
                    onClick={() => onDeliver(e.tracking_id)}
                    className="self-center gap-1 text-xs py-1 px-2.5 uppercase shadow-md"
                    disabled={isProcessing}
                    title="Marcar como entregado"
                  >
                    <FaTruck /> {t('routesPage.faTruck_entregado')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};