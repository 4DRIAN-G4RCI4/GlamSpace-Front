/**
 * GlamSpaces · HU-02 · Validaciones del registro de cliente.
 * Nombre, correo, contraseña (mínimo 8), confirmación y términos.
 */

import { validarDatosCuenta } from "../../utils/validarCuenta";

export function validarRegistroCliente(datos) {
  return validarDatosCuenta(datos);
}
