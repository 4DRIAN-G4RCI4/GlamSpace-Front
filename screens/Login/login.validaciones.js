/**
 * GlamSpaces · HU-04 · Validaciones del formulario de inicio de sesión.
 */

import { esCorreoValido } from "../../utils/validadores";

export function validarLogin({ correo, password }) {
  const errores = {};

  if (!correo.trim()) {
    errores.correo = "Escribe tu correo electrónico.";
  } else if (!esCorreoValido(correo)) {
    errores.correo = "El formato del correo no es válido.";
  }

  if (!password) {
    errores.password = "Escribe tu contraseña.";
  }

  return errores;
}
