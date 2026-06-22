
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

// Si mañana agregas envíos, sumarías algo como SHIPMENT_ERRORS aquí.

export const GLOBAL_BACKEND_ERROR_MAP = {
  ...AUTH_ERRORS,
  ...ROUTES_ERRORS,
  // ...SHIPMENT_ERRORS
};