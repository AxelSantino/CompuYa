export interface DateFilterParams {
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface CancellationReport {
  causa: string;
  cantidad: number;
}

export interface IncidentReport {
  total_incidencias: number;
  cancelaciones: CancellationReport[];
}

export interface DeliveredOnTime {
  total_envios: number;
  entregados_a_tiempo: number;
  tasa_entrega: number;
}

export interface DeliveredLate {
  total_envios: number;
  entregados_con_demora: number;
  tasa_demora: number;
}