/**
 * GlamSpaces · Sprint 7 · Reglas de "Conviértete en administrador". Funciones puras.
 *
 * El cliente confirma con su contraseña y la API convierte su cuenta: mismo correo, misma
 * contraseña y su historial de solicitudes se conserva. Se pide la contraseña porque todavía
 * no hay JWT, así que es la forma de comprobar que la cuenta la usa su dueño.
 *
 * POST /api/usuarios/convertirAAdministrador { usuarioId, contrasena }
 *   0    éxito, regresa el usuario ya como administrador
 *   1003 contraseña incorrecta
 *   1005 la cuenta no existe
 *   1006 la cuenta ya es administrador
 */

// Códigos que contesta este endpoint (ver CodigosError.cs del back).
export const CODIGOS_CONVERSION = {
  credencialesIncorrectas: 1003,
  usuarioNoEncontrado: 1005,
  yaEsAdministrador: 1006,
};

/** Antes de llamar a la API: la contraseña es obligatoria. */
export function validarConversion({ contrasena }) {
  const errores = {};
  if (!String(contrasena ?? "").trim()) {
    errores.contrasena = "Escribe tu contraseña para confirmar.";
  }
  return errores;
}

/** Solo una cuenta de cliente se puede convertir. */
export function puedeConvertirse(sesion) {
  return !!sesion && sesion.tipo_cuenta === "cliente" && !!sesion.id;
}

/**
 * Qué decirle al usuario cuando falla. Si la API manda `mensaje` se muestra tal cual (ya viene
 * en español); estos textos son el respaldo.
 * → { texto, campo } · `campo` marca el error debajo del campo cuando es de la contraseña.
 */
export function mensajeDeErrorConversion(error) {
  if (!error) return { texto: "Ocurrió un error, intenta de nuevo.", campo: null };
  if (error.tipo === "red") {
    return { texto: "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.", campo: null };
  }
  if (error.tipo === "config") {
    return { texto: "La app no tiene configurada la URL de la API (EXPO_PUBLIC_API_URL).", campo: null };
  }

  // La contraseña incorrecta se marca en su campo, aunque la API mande su propio mensaje.
  if (error.codigo === CODIGOS_CONVERSION.credencialesIncorrectas) {
    return { texto: error.mensaje || "La contraseña no es correcta.", campo: "contrasena" };
  }
  if (error.mensaje) return { texto: error.mensaje, campo: null };

  switch (error.codigo) {
    case CODIGOS_CONVERSION.usuarioNoEncontrado:
      return { texto: "Tu cuenta ya no existe. Inicia sesión de nuevo.", campo: null };
    case CODIGOS_CONVERSION.yaEsAdministrador:
      return { texto: "Tu cuenta ya es de administrador.", campo: null };
    default:
      return { texto: "Ocurrió un error, intenta de nuevo.", campo: null };
  }
}

/** Con 1006 la cuenta ya era administrador: no es un fallo, solo hay que recargar la sesión. */
export function yaEraAdministrador(error) {
  return !!error && error.codigo === CODIGOS_CONVERSION.yaEsAdministrador;
}

export const TEXTOS_CONVERSION = {
  titulo: "Conviértete en administrador",
  explicacion:
    "Tu cuenta pasa a ser de administrador y podrás publicar tus salones. Conservas tu correo, tu contraseña y tus solicitudes de cliente.",
  etiquetaContrasena: "Confirma tu contraseña",
  boton: "Convertir mi cuenta",
  exito: "¡Listo! Tu cuenta ya es de administrador. Publica tu primer salón.",
};
