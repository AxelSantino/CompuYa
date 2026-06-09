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