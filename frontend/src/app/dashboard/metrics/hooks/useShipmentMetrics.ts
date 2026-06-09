import { useMemo } from 'react';
import { Envio } from '@/types/envio';

export const useShipmentMetrics = (shipments: Envio[]) => {
  return useMemo(() => {
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

    const total = shipments.length;

    const alta = shipments.filter((s) => s.prioridad === 'alta').length;
    const media = shipments.filter((s) => s.prioridad === 'media').length;
    const baja = shipments.filter((s) => s.prioridad === 'baja').length;

    const enSucursal = shipments.filter((s) => s.estado === 'en sucursal').length;
    const enTransito = shipments.filter((s) => s.estado === 'en transito').length;
    const entregado = shipments.filter((s) => s.estado === 'entregado').length;
    const cancelado = shipments.filter((s) => s.estado === 'cancelado').length;

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
  }, [shipments]);
};