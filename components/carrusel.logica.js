/**
 * GlamSpaces · Navegación entre fotos de un salón (HU-07 fotos): carrusel de la tarjeta de
 * búsqueda y galería del detalle. Funciones puras (sin React), probadas con node --test.
 */

export const MAX_FOTOS_CARRUSEL = 5; // la API manda hasta 5 en fotosPreview
export const INTERVALO_CARRUSEL = 1500; // ms entre fotos mientras el mouse está encima
export const MINIATURAS_GALERIA = 4;
export const UMBRAL_DESLIZAR = 40; // px de arrastre horizontal para cambiar de foto

// Fotos de la tarjeta: `fotosPreview` (buscar/listar) o, si la API aún no lo manda, solo
// `fotoPrincipal`. Sin fotos → [] (la tarjeta muestra la inicial del salón).
export function fotosDeTarjeta(salon) {
  if (!salon) return [];
  if (Array.isArray(salon.fotosPreview)) {
    const preview = salon.fotosPreview.filter(Boolean).slice(0, MAX_FOTOS_CARRUSEL);
    if (preview.length > 0) return preview;
  }
  return salon.fotoPrincipal ? [salon.fotoPrincipal] : [];
}

// Con 0 o 1 foto no hay carrusel.
export function tieneCarrusel(fotos) {
  return Array.isArray(fotos) && fotos.length > 1;
}

// Avanza o retrocede dando la vuelta: (4, 5, 1) → 0   ·   (0, 5, -1) → 4
export function moverIndice(indice, total, paso) {
  if (!total || total < 2) return 0;
  return (((indice + paso) % total) + total) % total;
}

// Carga diferida: solo la foto que se ve y la siguiente (precarga). Regresa los índices ya
// cargados, ordenados, sin repetir.
export function conPrecarga(cargadas, indice, total) {
  const resultado = new Set(cargadas);
  if (total > 0) resultado.add(indice);
  if (total > 1) resultado.add(moverIndice(indice, total, 1));
  return [...resultado].sort((a, b) => a - b);
}

// Galería del detalle: cuántas miniaturas se pintan y cuántas fotos quedan fuera ("+N"
// sobre la última miniatura).
export function resumenMiniaturas(total, maximo = MINIATURAS_GALERIA) {
  const visibles = Math.min(Math.max(total, 0), maximo);
  return { visibles, extra: total > maximo ? total - maximo : 0 };
}

// Deslizar en móvil: dedo hacia la izquierda → siguiente (1), a la derecha → anterior (-1).
export function pasoPorDeslizamiento(dx, umbral = UMBRAL_DESLIZAR) {
  if (dx <= -umbral) return 1;
  if (dx >= umbral) return -1;
  return 0;
}
