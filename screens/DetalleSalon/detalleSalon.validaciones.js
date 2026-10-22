/**
 * GlamSpaces · HU-13 · Reglas para elegir la fecha del evento en el calendario.
 * Función pura: regresa el mensaje de error o null si la fecha se puede elegir.
 */

// Regla de negocio: solo fechas futuras (a partir de mañana) y que no estén ocupadas.
export function validarFechaEvento(clave, { hoy, ocupadas }) {
  if (clave <= hoy) {
    return "Solo puedes elegir fechas a partir de mañana.";
  }
  if (ocupadas.includes(clave)) {
    return "Esa fecha ya está reservada. Elige una fecha disponible.";
  }
  return null;
}
