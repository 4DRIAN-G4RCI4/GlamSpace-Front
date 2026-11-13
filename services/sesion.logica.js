/**
 * GlamSpaces · Reglas puras sobre la sesión guardada. Sin React ni red.
 *
 * Nace para corregir un error de "Mi salón": el campo "Nombre del salón" aparecía prellenado
 * con el CORREO del usuario. Pasaba porque, si la cuenta no tenía `nombre_salon`, se caía al
 * `nombre` del usuario, y en varias cuentas ese nombre es el propio correo.
 *
 * Ahora solo se sugiere un nombre cuando de verdad es un nombre de negocio: nunca un correo.
 */

// Algo que parezca "alguien@algo.mx" no es el nombre de un salón.
const PARECE_CORREO = /@/;

/** ¿Este texto es un nombre de negocio utilizable (y no un correo)? */
export function esNombreDeNegocio(valor) {
  const texto = String(valor ?? "").trim();
  if (!texto) return false;
  return !PARECE_CORREO.test(texto);
}

/**
 * Nombre del salón que se puede sugerir a partir de la sesión.
 * Solo se usa `nombre_salon` (el que el administrador escribió al registrarse) y solo si
 * no es un correo. Nunca se usa el nombre del usuario: no es el nombre de su salón.
 * → el nombre, o "" para que el campo quede vacío.
 */
export function nombreDeNegocio(sesion) {
  if (!sesion) return "";
  const nombreSalon = sesion.nombre_salon;
  return esNombreDeNegocio(nombreSalon) ? String(nombreSalon).trim() : "";
}
