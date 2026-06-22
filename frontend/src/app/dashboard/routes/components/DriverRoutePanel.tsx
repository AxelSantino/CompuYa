import React from 'react';
import dynamic from 'next/dynamic';
import { FaTruck, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Envio } from '@/types/envio';
import { Button } from '@/components/ui/Button';

// 1. i18n: Micro-componente para traducir el estado de carga del mapa
const LoadingMap = () => {
  const { t } = useTranslation();
  return (
    <div aria-busy="true" className="w-full h-[500px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-500 font-medium">
      {t('routesPage.cargando_mapa_ruta', 'Cargando mapa de ruta...')}
    </div>
  );
};

const MapHojaRuta = dynamic(() => import('@/components/MapHojaRuta'), { 
  ssr: false,
  loading: () => <LoadingMap />
});

// Ajuste de contraste en el fallback (text-gray-700)
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
        <FaRoute aria-hidden="true" className="text-6xl mx-auto mb-4 opacity-75" />
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
            <FaTruck aria-hidden="true" /> 
            {selectedDriverId ? t('routesPage.visualizando_recorrido_del_repartidor') : t('routesPage.mi_hoja_de_ruta_optimizada')}
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
          {/* 2. Semántica: Reemplazamos div por ol (Ordered List) */}
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-gray-100 list-none m-0 p-0">
            {route.map((e, index) => (
              // 3. Semántica: Reemplazamos div por li (List Item)
              <li key={e.id} className="p-4 flex items-start justify-between gap-4 group hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Ocultamos el número visual al lector de pantalla, ya que el <li> lo anuncia nativamente */}
                  <div aria-hidden="true" className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 text-sm">{e.tracking_id}</p>
                      
                      {/* i18n seguro con toLowerCase() */}
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border font-bold ${PRIORITY_TAG_CLASSES[e.prioridad.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                        {t(`routesPage.prioridades.${e.prioridad.toLowerCase()}`, e.prioridad)}
                      </span>
                    </div>
                    {/* Contraste: text-gray-600 */}
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt aria-hidden="true" className="text-gray-400" /> 
                      {e.destinatario.perfil_empresa?.razon_social}
                    </p>
                  </div>
                </div>
                
                {(!selectedDriverId && (userRole === 'repartidor' || userRole === 'operador')) && (
                  <Button 
                    variant="success"
                    onClick={() => onDeliver(e.tracking_id)}
                    className="self-center gap-1 text-xs py-1 px-2.5 uppercase shadow-md"
                    disabled={isProcessing}
                    // i18n y a11y: Título y aria-label dinámicos traducidos
                    title={t('routesPage.marcar_como_entregado', 'Marcar como entregado')}
                    aria-label={`${t('routesPage.marcar_como_entregado', 'Marcar como entregado')} ${e.tracking_id}`}
                  >
                    <FaTruck aria-hidden="true" /> {t('routesPage.faTruck_entregado')}
                  </Button>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};