import { useMemo } from 'react';
import { Envio } from '@/types/envio';
import { DateFilterParams } from '@/types/metrics';

export const useShipmentMetrics = (shipments: Envio[], filters?: DateFilterParams) => {
  return useMemo(() => {

    let enviosFiltrados = shipments;

    if (filters?.fecha_inicio && filters?.fecha_fin) {
      const start = new Date(filters.fecha_inicio).getTime();
      const end = new Date(filters.fecha_fin).getTime() + 86399999;

      enviosFiltrados = shipments.filter((s) => {

        const fechaEnvioStr =  s.fecha_creacion; 
        
        if (!fechaEnvioStr) return false;
        
        const envioTime = new Date(fechaEnvioStr).getTime();
        return envioTime >= start && envioTime <= end;
      });
    }

    if (!shipments || shipments.length === 0) {
      return {
        alta: 0,
        media: 0,
        baja: 0,
        enSucursal: 0,
        enTransito: 0,
        entregado: 0,
        cancelado: 0,
        total: 0,
        porcentajeEntregado: 0,
      };
    }

    const total = enviosFiltrados.length;

    const alta = enviosFiltrados.filter((s) => s.prioridad === 'alta').length;
    const media = enviosFiltrados.filter((s) => s.prioridad === 'media').length;
    const baja = enviosFiltrados.filter((s) => s.prioridad === 'baja').length;

    const enSucursal = enviosFiltrados.filter((s) => s.estado === 'en sucursal').length;
    const enTransito = enviosFiltrados.filter((s) => s.estado === 'en transito').length;
    const entregado = enviosFiltrados.filter((s) => s.estado === 'entregado').length;
    const cancelado = enviosFiltrados.filter((s) => s.estado === 'cancelado').length;

    const porcentajeEntregado = total > 0 ? Math.round((entregado / total) * 100) : 0;

    return {
      alta,
      media,
      baja,
      enSucursal,
      enTransito,
      entregado,
      cancelado,
      total,
      porcentajeEntregado,
    };
  }, [shipments, , filters?.fecha_inicio, filters?.fecha_fin]);
};