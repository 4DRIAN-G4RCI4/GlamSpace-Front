/**
 * GlamSpaces · HU-03 · Validaciones del registro de administrador.
 * Los mismos datos que un cliente, más el nombre del salón (obligatorio).
 */

import { validarDatosCuenta } from "../../utils/validarCuenta";

export function validarRegistroAdministrador({ nombreSalon, ...datosCuenta }) {
  const errores = validarDatosCuenta(datosCuenta);

  if (!nombreSalon.trim()) {
    errores.nombreSalon = "Escribe el nombre de tu salón.";
  }

  return errores;
}
