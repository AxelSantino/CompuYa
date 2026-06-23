import { useMemo } from 'react';
import { Envio } from '@/types/envio';
import { DateFilterParams } from '@/types/metrics';

export const useShipmentMetrics = (shipments: Envio[], filters?: DateFilterParams) => {
  return useMemo(() => {
    
    // 1. Cláusula de guardia temprana: Si no hay datos crudos, abortamos y devolvemos 0
    if (!shipments || shipments.length === 0) {
      return { alta: 0, media: 0, baja: 0, enSucursal: 0, enTransito: 0, entregado: 0, cancelado: 0, total: 0, porcentajeEntregado: 0 };
    }

    let enviosFiltrados = shipments;

    // 2. Filtro de Fechas
    if (filters?.fecha_inicio && filters?.fecha_fin) {
      const start = new Date(filters.fecha_inicio).getTime();
      const end = new Date(filters.fecha_fin).getTime() + 86399999;

      enviosFiltrados = shipments.filter((s) => {
        const fechaEnvioStr = s.fecha_creacion; 
        if (!fechaEnvioStr) return false;
        
        const envioTime = new Date(fechaEnvioStr).getTime();
        return envioTime >= start && envioTime <= end;
      });
    }

    const total = enviosFiltrados.length;

    // 3. Segunda guardia: Si después del filtro de fechas quedó vacío, devolvemos 0
    if (total === 0) {
      return { alta: 0, media: 0, baja: 0, enSucursal: 0, enTransito: 0, entregado: 0, cancelado: 0, total: 0, porcentajeEntregado: 0 };
    }

    // 4. ALGORITMO O(n) (Single Pass): Recorremos el array una sola vez
    const metrics = {
      alta: 0, media: 0, baja: 0,
      enSucursal: 0, enTransito: 0, entregado: 0, cancelado: 0
    };

    for (let i = 0; i < total; i++) {
      const s = enviosFiltrados[i];

      // Contadores de Prioridad
      if (s.prioridad === 'alta') metrics.alta++;
      else if (s.prioridad === 'media') metrics.media++;
      else if (s.prioridad === 'baja') metrics.baja++;

      // Contadores de Estado
      if (s.estado === 'en sucursal') metrics.enSucursal++;
      else if (s.estado === 'en transito') metrics.enTransito++;
      else if (s.estado === 'entregado') metrics.entregado++;
      else if (s.estado === 'cancelado') metrics.cancelado++;
    }

    const porcentajeEntregado = Math.round((metrics.entregado / total) * 100);

    return {
      ...metrics,
      total,
      porcentajeEntregado,
    };
    
  // 5. Bug de sintaxis corregido (Se eliminó la coma duplicada)
  }, [shipments, filters?.fecha_inicio, filters?.fecha_fin]);
};