/**
 * GlamSpaces · Sprint 10 · Verificación del correo y recuperación de la cuenta. Funciones puras.
 *
 * Contrato con la API (lo implementa el back; el front ya está listo):
 *
 *   POST /api/usuarios/registro          → igual que hoy; el usuario trae `correoVerificado: false`
 *                                          y la API ya mandó el código de verificación.
 *   POST /api/usuarios/login             → 1007 si el correo no se ha verificado (la API reenvía el código).
 *   POST /api/usuarios/verificarCorreo   { correo, codigo }            → el usuario (inicia sesión).
 *   POST /api/usuarios/reenviarCodigo    { correo, proposito }         → mensaje. proposito: "verificacion" | "recuperacion"
 *   POST /api/usuarios/recuperar         { correo }                    → siempre el mismo mensaje (no revela si existe).
 *   POST /api/usuarios/restablecer       { correo, codigo, nuevaContrasena } → mensaje.
 *
 * Códigos nuevos (CodigosError.cs del back):
 *   1007 correo sin verificar · 1008 código incorrecto · 1009 código vencido
 *   1010 demasiados intentos con ese código · 1011 hay que esperar para pedir otro código
 */

import { LONGITUD_MIN_PASSWORD } from "../utils/validadores";

export const LONGITUD_CODIGO = 6;
export const ESPERA_REENVIO_SEGUNDOS = 60;

export const CODIGOS_CORREO = {
  correoSinVerificar: 1007,
  codigoIncorrecto: 1008,
  codigoVencido: 1009,
  demasiadosIntentos: 1010,
  esperaParaReenviar: 1011,
};

/** Deja solo dígitos y como máximo 6 (lo que se pega desde el correo puede traer espacios). */
export function limpiarCodigo(texto) {
  return String(texto ?? "").replace(/\D/g, "").slice(0, LONGITUD_CODIGO);
}

export function validarCodigo(codigo) {
  const errores = {};
  if (limpiarCodigo(codigo).length !== LONGITUD_CODIGO) {
    errores.codigo = `Escribe el código de ${LONGITUD_CODIGO} dígitos que te llegó por correo.`;
  }
  return errores;
}

/** Paso 2 de la recuperación: código, nueva contraseña y su confirmación (mismas reglas que el registro). */
export function validarRestablecer({ codigo, password, password2 }) {
  const errores = validarCodigo(codigo);
  if (!password) {
    errores.password = "Escribe tu nueva contraseña.";
  } else if (password.length < LONGITUD_MIN_PASSWORD) {
    errores.password = `La contraseña debe tener al menos ${LONGITUD_MIN_PASSWORD} caracteres.`;
  }
  if (!password2 || password2 !== password) {
    errores.password2 = "Las contraseñas no coinciden.";
  }
  return errores;
}

/** ¿El login falló porque falta verificar el correo? Entonces se va a la pantalla del código. */
export function faltaVerificarCorreo(error) {
  return !!error && error.codigo === CODIGOS_CORREO.correoSinVerificar;
}

/** Tras registrarse: la API nueva marca la cuenta como no verificada. Con la API de hoy no cambia nada. */
export function requiereVerificacion(usuario) {
  return !!usuario && usuario.correoVerificado === false;
}

/**
 * Qué decirle al usuario cuando falla verificar, reenviar o restablecer.
 * → { texto, campo } · `campo` marca el error debajo del campo del código.
 */
export function mensajeDeErrorCodigo(error) {
  if (!error) return { texto: "Ocurrió un error, intenta de nuevo.", campo: null };
  if (error.tipo === "red") {
    return { texto: "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.", campo: null };
  }
  switch (error.codigo) {
    case CODIGOS_CORREO.codigoIncorrecto:
      return { texto: "El código no es correcto. Revísalo e intenta de nuevo.", campo: "codigo" };
    case CODIGOS_CORREO.codigoVencido:
      return { texto: "El código ya venció. Pide uno nuevo.", campo: "codigo" };
    case CODIGOS_CORREO.demasiadosIntentos:
      return { texto: "Hiciste demasiados intentos con este código. Pide uno nuevo.", campo: "codigo" };
    case CODIGOS_CORREO.esperaParaReenviar:
      return { texto: "Espera un momento antes de pedir otro código.", campo: null };
    default:
      return { texto: error.mensaje || "Ocurrió un error, intenta de nuevo.", campo: null };
  }
}

/** "correo@dominio.com" → "co•••@dominio.com" para mostrar a dónde se mandó el código. */
export function ocultarCorreo(correo) {
  const [usuario, dominio] = String(correo ?? "").trim().split("@");
  if (!usuario || !dominio) return String(correo ?? "");
  return `${usuario.slice(0, 2)}•••@${dominio}`;
}

export const TEXTOS_CORREO = {
  verificarTitulo: "Verifica tu correo",
  verificarTexto: (correo) => `Te enviamos un código de ${LONGITUD_CODIGO} dígitos a ${ocultarCorreo(correo)}. Escríbelo para activar tu cuenta.`,
  verificarBoton: "Verificar mi correo",
  reenviar: "Reenviar código",
  reenviarEn: (s) => `Reenviar código en ${s} s`,
  reenviado: "Te mandamos un código nuevo.",
  recuperarTitulo: "Recupera tu cuenta",
  recuperarTexto: "Escribe el correo de tu cuenta y te mandaremos un código para cambiar tu contraseña.",
  recuperarBoton: "Enviar código",
  restablecerTitulo: "Crea tu nueva contraseña",
  restablecerTexto: (correo) => `Si ${ocultarCorreo(correo)} tiene una cuenta, te llegó un código de ${LONGITUD_CODIGO} dígitos. Escríbelo junto con tu nueva contraseña.`,
  restablecerBoton: "Cambiar contraseña",
  listoTitulo: "¡Listo!",
  listoTexto: "Tu contraseña se cambió. Ya puedes iniciar sesión con la nueva.",
  olvidaste: "¿Olvidaste tu contraseña?",
};
