
export const AUTH_ERRORS: Record<string, string> = {
  "Tu cuenta se encuentra desactivada. Por favor, contactá a un administrador.": "login.errores.cuenta_desactivada",
  "Email o contraseña incorrectos": "login.errores.credenciales_invalidas",

  // parchazo para no tener problema con el authcredentials
  "Email o contraseña incorrectos.": "login.errores.credenciales_invalidas",
  "Email or password incorrect": "login.errores.credenciales_invalidas",
};

// Si mañana agregas envíos, sumarías algo como SHIPMENT_ERRORS aquí.

export const GLOBAL_BACKEND_ERROR_MAP = {
  ...AUTH_ERRORS,
  // ...SHIPMENT_ERRORS
};