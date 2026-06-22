import React from 'react';
import { FaUserTie, FaMagic, FaWarehouse } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Envio } from '@/types/envio';
import { Repartidor } from '../hooks/useRouteManagment';

const PRIORITY_TAG_CLASSES: Record<string, string> = {
  'alta': 'bg-orange-100 text-orange-700 border-orange-200',
  'media': 'bg-blue-100 text-blue-700 border-blue-200',
  'baja': 'bg-green-100 text-green-700 border-green-200',
};

interface SupervisorPanelProps { /* ... (mantén tus props iguales) ... */ 
  repartidores: Repartidor[];
  selectedDriverId: number | null;
  onSelectDriver: (id: number | null) => void;
  shipments: Envio[];
  onManualAssign: (trackingId: string) => void;
}

export const SupervisorPanel: React.FC<SupervisorPanelProps> = ({
  repartidores, selectedDriverId, onSelectDriver, shipments, onManualAssign
}) => {
  const { t } = useTranslation();

  return (
    <div className="xl:col-span-1 space-y-6">
      
      {/* CARD 1: Filtro */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 font-bold text-lg">
          <h2 className="text-gray-800 flex items-center gap-2">
            <FaUserTie className="text-blue-600" /> {t('routesPage.monitoreo_por_repartidor')}
          </h2>
        </div>
        <div className="p-5">
          <select 
            aria-label={t('routesPage.seleccionar_repartidor_para_ver_ruta')}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium outline-none transition-all cursor-pointer"
            value={selectedDriverId || ''}
            onChange={(e) => onSelectDriver(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('routesPage.seleccionar_repartidor_para_ver_ruta')}.</option>
            {repartidores.map(r => (
              <option key={r.id} value={r.id}>
                {r.perfil_empleado?.nombre} {r.perfil_empleado?.apellido} ({r.email})
              </option>
            ))}
          </select>
          
          {selectedDriverId && (
            <button 
              onClick={() => onSelectDriver(null)}
              // Ajustamos también el botón de limpiar para que combine sobre el fondo blanco
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            >
              {t('routesPage.limpiar_filtro')}
            </button>
          )}
        </div>
      </div>

      {/* CARD 2: Lista de envíos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between font-bold text-lg text-gray-800">
          <h2 className="flex items-center gap-2"><FaMagic /> {t('routesPage.envios_en_sucursal')}</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
            {shipments.length} {t('routesPage.pendientes')}
          </span>
        </div>
        
        {/* Scrollbar estilizado con Tailwind */}
        <div className="p-0 overflow-y-auto max-h-[400px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
          {shipments.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <FaWarehouse className="text-4xl mx-auto mb-3 opacity-20" />
              <p>{t('routesPage.no_hay_envios_pendientes')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {shipments.map(s => (
                <li key={s.id} className="p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{s.tracking_id}</p>
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border font-bold ${PRIORITY_TAG_CLASSES[s.prioridad] || 'bg-gray-100 text-gray-600'}`}>
                          {t(`routesPage.prioridades.${s.prioridad.toLowerCase()}`, s.prioridad)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate max-w-[150px]">{s.destinatario.perfil_empresa?.razon_social}</p>
                    </div>
                    {/* Reemplazo de .btn-assign */}
                    <Button 
                      variant="primary" 
                      onClick={() => onManualAssign(s.tracking_id)}
                      aria-label={`${t('routesPage.faMagic_asignar')} ${s.tracking_id}`}
                      className="gap-1 text-xs py-1.5 px-3 group-hover:scale-105"
                    >
                      <FaMagic aria-hidden="true"/> {t('routesPage.faMagic_asignar')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};