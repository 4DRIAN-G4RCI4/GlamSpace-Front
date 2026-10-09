/**
 * GlamSpaces · Validación de los datos comunes de una cuenta nueva.
 * La usan el registro de cliente (HU-02) y el de administrador (HU-03).
 */

import { esCorreoValido, LONGITUD_MIN_PASSWORD } from "./validadores";

export function validarDatosCuenta({ nombre, correo, password, password2, aceptaTerminos }) {
  const errores = {};

  if (!nombre.trim()) {
    errores.nombre = "Escribe tu nombre completo.";
  }

  if (!correo.trim()) {
    errores.correo = "Escribe tu correo electrónico.";
  } else if (!esCorreoValido(correo)) {
    errores.correo = "El formato del correo no es válido.";
  }

  if (!password) {
    errores.password = "Escribe una contraseña.";
  } else if (password.length < LONGITUD_MIN_PASSWORD) {
    errores.password = `La contraseña debe tener al menos ${LONGITUD_MIN_PASSWORD} caracteres.`;
  }

  if (!password2 || password2 !== password) {
    errores.password2 = "Las contraseñas no coinciden.";
  }

  if (!aceptaTerminos) {
    errores.terminos = "Debes aceptar los términos para continuar.";
  }

  return errores;
}
