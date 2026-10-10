/**
 * GlamSpaces · HU-10 · Reglas de los filtros de búsqueda.
 * Funciones puras: regresan el mensaje de error o null si el valor es válido.
 */

import { aNumero } from "../../utils/validadores";

export function validarCapacidad(texto) {
  const numero = aNumero(texto);
  if (!Number.isInteger(numero) || numero <= 0) {
    return "Escribe un número de personas mayor a 0 (sin decimales).";
  }
  return null;
}

export function validarPrecio(texto) {
  const numero = aNumero(texto);
  if (Number.isNaN(numero) || numero <= 0) {
    return "Escribe un precio mayor a 0.";
  }
  return null;
}
