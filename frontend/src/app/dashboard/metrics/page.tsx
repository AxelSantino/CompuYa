'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import { Envio } from '@/types/envio';
import ShipmentMetrics from '@/app/dashboard/metrics/ShipmentMetrics';
import LoadingOverlay from '@/components/LoadingOverlay';
import { DateFilterParams } from '@/types/metrics';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

import { useExportMetrics } from '@/app/dashboard/metrics/hooks/useExportMetrics';
import { DropdownExport } from '@/components/ui/DropdownExport';

const MetricsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Envio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fechaInicio, setFechaInicio] = useState('2026-05-01');
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

  const dateFilters: DateFilterParams = {
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  };

  const { isExporting, exportToZip } = useExportMetrics(dateFilters);

  useEffect(() => {
    let isMounted = true;

    const loadShipments = async () => {
      if (!user) {
        return;
      }

      if (user.rol !== 'admin') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await shipmentService.getShipments();
        if (isMounted) {
          setShipments(data);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError(t('metricsPage.error_al_cargar_metricas'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadShipments();

    return () => {
      isMounted = false;
    };
  }, [user, fechaInicio, fechaFin]);

  return (
    <DashboardLayout>
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-md">
        <LoadingOverlay isLoading={isLoading} text={t('metricsPage.cargando_metricas')} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-orange-700">
          <div>
            {/* a11y: Corregido de h2 a h1 */}
            <h1 className="text-2xl font-bold mb-1">{t('metricsPage.metricas_envios')}</h1>
            <p className="text-gray-600">
              {t('metricsPage.indicadores_prioridad')}
            </p>
          </div>
        </div>

        {/* =========================================
            BARRA DE HERRAMIENTAS (Filtros + Exportación)
            ========================================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
          
          {/* Controles de Fecha */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <div className="flex flex-col w-full sm:w-auto">
                {/* a11y: Agregado htmlFor y contraste mejorado a gray-600 */}
                <label htmlFor="fecha_inicio" className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">
                  {t('metricsPage.fecha_desde')}
                </label>
                <input 
                  id="fecha_inicio"
                  type="date" 
                  value={fechaInicio} 
                  onChange={(e) => setFechaInicio(e.target.value)}
                  // a11y: Foco corregido a focus-visible
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none text-gray-700 w-full"
                />
              </div>
              
              {/* a11y: Ocultado elemento puramente decorativo */}
              <span aria-hidden="true" className="text-gray-300 hidden sm:inline mt-4 font-bold">-</span>
              
              <div className="flex flex-col w-full sm:w-auto">
                {/* a11y: Agregado htmlFor y contraste mejorado a gray-600 */}
                <label htmlFor="fecha_fin" className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">
                  {t('metricsPage.fecha_hasta')}
                </label>
                <input 
                  id="fecha_fin"
                  type="date" 
                  value={fechaFin} 
                  onChange={(e) => setFechaFin(e.target.value)}
                  // a11y: Foco corregido a focus-visible
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none text-gray-700 w-full"
                />
              </div>
          </div>

          {/* Botón de Exportación */}
          {user?.rol === 'admin' && !error && (
            <div className="w-full md:w-auto flex md:justify-end mt-2 md:mt-0 pt-4 md:pt-0 border-t border-gray-200 md:border-t-0">
              <DropdownExport 
                isExporting={isExporting} 
                onExportZip={exportToZip} 
              />
            </div>
          )}

        </div>

        {user?.rol !== 'admin' ? (
          // a11y: Agregado role="alert"
          <div role="alert" className="py-16 text-center text-gray-700">
            <p className="text-lg font-semibold">{t('metricsPage.acceso_denegado')}</p>
            {/* Contraste mejorado a gray-600 */}
            <p className="mt-2 text-sm text-gray-600">{t('metricsPage.solo_admin_ven_metricas')}</p>
          </div>
        ) : error ? (
          // a11y: Agregado role="alert" y contraste de rojo subido a 600
          <div role="alert" className="py-8 text-center text-red-600 font-medium">{error}</div>
        ) : (
          <ShipmentMetrics shipments={shipments} isLoading={isLoading} filters={dateFilters} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default withAuth(MetricsPage, ['admin']);