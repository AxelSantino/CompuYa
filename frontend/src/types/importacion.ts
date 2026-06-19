// Tipos para la validación (Endpoint /validar)
export interface ValidationError {
  fila: number;
  errores: string[];
}

export interface ValidationResponse {
  mensaje: string;
  datos?: any[];
  errores?: ValidationError[];
}

// Tipos para la confirmación (Endpoint /confirmar)
export interface ImportCreatedItem {
  tracking_id: string;
  destinatario: string;
}

export interface ImportErrorItem {
  fila: number;
  error: string;
}

export interface ConfirmImportResponse {
  mensaje: string;
  creados: ImportCreatedItem[];
  errores: ImportErrorItem[];
}