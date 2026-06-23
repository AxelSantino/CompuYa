
export const AUTH_ERRORS: Record<string, string> = {
  "Tu cuenta se encuentra desactivada. Por favor, contactá a un administrador.": "login.errores.cuenta_desactivada",
  "Email o contraseña incorrectos": "login.errores.credenciales_invalidas",

  // parchazo para no tener problema con el authcredentials
  "Email o contraseña incorrectos.": "login.errores.credenciales_invalidas",
  "Email or password incorrect": "login.errores.credenciales_invalidas",
};

export const ROUTES_ERRORS: Record<string, string> = {
  "PIN inválido. Verifique el código con el cliente.": "routesPage.errores.pin_invalido",
  "El envío no se puede entregar ya que su estado esta cancelado": "routesPage.errores.envio_cancelado",
  "El envío no se puede entregar ya que su estado esta en sucursal": "routesPage.errores.envio_en_sucursal",
  "No se encontraron repartidores en el sistema.": "routesPage.errores.no_hay_repartidores",
  "No hay envíos pendientes en sucursal": "routesPage.errores.no_hay_envios_pendientes",
}

export const CSV_IMPORT_ERRORS: Record<string, string> = {
  "err_extension_invalida": "importCsvPage.errores.err_extension_invalida",
  "err_codificacion_invalida": "importCsvPage.errores.err_codificacion_invalida",
  "err_columnas_faltantes": "importCsvPage.errores.err_columnas_faltantes",
  "err_tipo_envio_invalido": "importCsvPage.errores.err_tipo_envio_invalido",
  "err_restriccion_invalida": "importCsvPage.errores.err_restriccion_invalida",
  "validacion_exitosa": "importCsvPage.errores.validacion_exitosa",
  "importacion_completada": "importCsvPage.errores.importacion_completada",
  "err_validacion_filas_fallida": "importCsvPage.errores.err_validacion_filas_fallida",
  "err_importacion_fallida_completamente": "importCsvPage.errores.err_importacion_fallida_completamente",
  "err_insercion_bd_fallida": "importCsvPage.errores.err_insercion_bd_fallida",
  "err_destinatario_no_encontrado": "importCsvPage.errores.err_destinatario_no_encontrado",
  "err_destinatario_inactivo": "importCsvPage.errores.err_destinatario_inactivo",
  "err_sin_sucursal_disponible": "importCsvPage.errores.err_sin_sucursal_disponible"
}

// Si mañana agregas envíos, sumarías algo como SHIPMENT_ERRORS aquí.

export const GLOBAL_BACKEND_ERROR_MAP = {
  ...AUTH_ERRORS,
  ...ROUTES_ERRORS,
  ...CSV_IMPORT_ERRORS
  // ...SHIPMENT_ERRORS
};