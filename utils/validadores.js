/**
 * GlamSpaces · Validadores básicos reutilizables por todas las pantallas.
 * Funciones puras: sin React, sin red.
 */

// Cada tramo del dominio excluye el punto: así el motor no tiene que probar varias
// particiones de la misma cadena (evita el retroceso super-lineal que marca Sonar S8786).
const REGEX_CORREO = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const REGEX_URL = /^https?:\/\/[^\s/$.?#][^\s]*$/i;

export const LONGITUD_MIN_PASSWORD = 8;

export function esCorreoValido(correo) {
  return REGEX_CORREO.test(String(correo).trim());
}

export function esUrlValida(url) {
  return REGEX_URL.test(String(url).trim());
}

// Acepta "1500", "1,500", "$1,500.50". La coma se toma como separador de miles.
export function aNumero(valor) {
  const limpio = String(valor).replace(/[$\s,]/g, "");
  return limpio === "" ? Number.NaN : Number(limpio);
}
