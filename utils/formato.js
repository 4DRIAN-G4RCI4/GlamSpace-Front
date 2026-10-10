/**
 * GlamSpaces · Formato de valores para mostrar en pantalla. Funciones puras.
 */

// 8500 → "$8,500"   ·   8500.5 → "$8,500.50"
export function formatearPrecio(valor) {
  const numero = Number(valor);
  return `$${numero.toLocaleString("es-MX", {
    minimumFractionDigits: Number.isInteger(numero) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
